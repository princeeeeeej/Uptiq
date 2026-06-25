import {
  xAckBulk,
  xCreateGroup,
  xReadGroup,
  reclaimStuck,
  CHECK_STREAM,
  type WebsiteEvent,
} from 'redisstream/client';
import { prismaclient } from 'store/client';
import tls from 'tls';
import { URL } from 'url';

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) throw new Error('REGION_ID not provided');
if (!WORKER_ID) throw new Error('WORKER_ID not provided');

async function getSSLCertDetails(urlString: string): Promise<{ issuer: string; validFrom: Date; validUntil: Date; daysRemaining: number } | null> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(urlString);
      if (parsedUrl.protocol !== 'https:') {
        return resolve(null);
      }
      
      const port = parsedUrl.port ? parseInt(parsedUrl.port) : 443;
      const socket = tls.connect({
        host: parsedUrl.hostname,
        port: port,
        servername: parsedUrl.hostname,
        rejectUnauthorized: false
      }, () => {
        const cert = socket.getPeerCertificate();
        socket.destroy();
        
        if (!cert || !cert.valid_to) {
          return resolve(null);
        }
        
        const validFrom = new Date(cert.valid_from);
        const validUntil = new Date(cert.valid_to);
        const daysRemaining = Math.max(0, Math.ceil((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        
        resolve({
          issuer: cert.issuer.CN || cert.issuer.O || 'Unknown',
          validFrom,
          validUntil,
          daysRemaining
        });
      });
      
      socket.on('error', (err) => {
        resolve(null);
      });
      
      socket.setTimeout(5000);
      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

async function handleCheckResult(
  websiteId: string,
  url: string,
  status: 'UP' | 'DOWN',
  statusCode: number | null,
  responseTimeMs: number,
  errorMessage: string | null
) {
  try {
    // 1. Log the tick
    await prismaclient.websiteTick.create({
      data: {
        websiteId,
        regionId: REGION_ID,
        status,
        statusCode,
        responseTimeMs,
        errorMessage,
        checkedAt: new Date(),
      },
    });

    // 2. Fetch current status
    const currentStatus = await prismaclient.websiteStatusCurrent.findUnique({
      where: { websiteId },
    });

    let consecutiveFails = 0;
    if (status === 'DOWN') {
      consecutiveFails = (currentStatus?.consecutiveFails ?? 0) + 1;
    }

    // 3. Upsert current status
    await prismaclient.websiteStatusCurrent.upsert({
      where: { websiteId },
      create: {
        websiteId,
        currentStatus: status,
        consecutiveFails,
        lastCheckedAt: new Date(),
        lastResponseTimeMs: responseTimeMs,
      },
      update: {
        currentStatus: status,
        consecutiveFails,
        lastCheckedAt: new Date(),
        lastResponseTimeMs: responseTimeMs,
      },
    });

    // 4. Incident detection
    const previousStatus = currentStatus?.currentStatus ?? 'UNKNOWN';
    if (previousStatus !== 'DOWN' && status === 'DOWN') {
      // Outage detected, verify if there's an active incident
      const activeIncident = await prismaclient.incident.findFirst({
        where: {
          websiteId,
          resolvedAt: null,
        },
      });
      if (!activeIncident) {
        await prismaclient.incident.create({
          data: {
            websiteId,
            startedAt: new Date(),
            reason: errorMessage || `Status check failed with code ${statusCode}`,
          },
        });
      }
    } else if (previousStatus === 'DOWN' && status === 'UP') {
      // Outage resolved, close active incidents
      const activeIncidents = await prismaclient.incident.findMany({
        where: {
          websiteId,
          resolvedAt: null,
        },
      });
      for (const incident of activeIncidents) {
        const resolvedAt = new Date();
        const durationSeconds = Math.ceil((resolvedAt.getTime() - incident.startedAt.getTime()) / 1000);
        await prismaclient.incident.update({
          where: { id: incident.id },
          data: {
            resolvedAt,
            durationSeconds,
          },
        });
      }
    }

    // 5. Update SSL status if HTTPS
    if (url.startsWith('https://')) {
      const ssl = await getSSLCertDetails(url);
      if (ssl) {
        await prismaclient.websiteSSLStatus.upsert({
          where: { websiteId },
          create: {
            websiteId,
            issuer: ssl.issuer,
            validFrom: ssl.validFrom,
            validUntil: ssl.validUntil,
            daysRemaining: ssl.daysRemaining,
            lastCheckedAt: new Date(),
          },
          update: {
            issuer: ssl.issuer,
            validFrom: ssl.validFrom,
            validUntil: ssl.validUntil,
            daysRemaining: ssl.daysRemaining,
            lastCheckedAt: new Date(),
          },
        });
      }
    }
  } catch (err) {
    console.error('Failed to handle check result database updates:', err);
  }
}

async function fetchWebsite(url: string, websiteId: string) {
  const startTime = Date.now();

  try {
    const res = await fetch(url);
    const responseTimeMs = Date.now() - startTime;
    console.log({
      websiteId,
      url,
      status: res.ok ? 'UP' : 'DOWN',
      responseTimeMs
    });

    await handleCheckResult(
      websiteId,
      url,
      res.ok ? 'UP' : 'DOWN',
      res.status,
      responseTimeMs,
      null
    );
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    console.error({
      websiteId,
      url,
      status: 'DOWN',
      responseTimeMs,
      error: err?.message
    });

    await handleCheckResult(
      websiteId,
      url,
      'DOWN',
      null,
      responseTimeMs,
      err?.message ?? 'Unknown error'
    );
  }
}

async function processBatch() {
  const messages = await xReadGroup<WebsiteEvent>(
    CHECK_STREAM,
    REGION_ID,
    WORKER_ID,
  );

  if (!messages?.length) {
    return;
  }

  await Promise.all(
    messages.map(({ message }) => fetchWebsite(message.url, message.id)),
  );

  await xAckBulk(
    CHECK_STREAM,
    REGION_ID,
    messages.map(({ id }) => id),
  );

  console.log(`[${WORKER_ID}] processed ${messages.length} jobs`);
}

async function main() {
  console.log(`Worker ${WORKER_ID} starting in region ${REGION_ID}`);

  await xCreateGroup(CHECK_STREAM, REGION_ID);

  setInterval(() => {
    reclaimStuck(CHECK_STREAM, REGION_ID, WORKER_ID).catch(console.error);
  }, 30_000);

  while (true) {
    try {
      await processBatch();
    } catch (err) {
      console.error('processBatch error:', err);
    }
  }
}

main();
