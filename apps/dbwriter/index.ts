import {
  xAckBulk,
  xCreateGroup,
  xReadGroup,
  reclaimStuck,
  DB_WRITE_STREAM,
  type DBWriteEvent,
  type StreamMessage,
} from 'redisstream/client';
import { prismaclient } from 'store/client';
import tls from 'tls';
import { URL } from 'url';
import { fireAlerts, type AlertPayload } from './alerts';

const REGION_ID = process.env.REGION_ID || 'global-writer';
const WORKER_ID = process.env.WORKER_ID || `dbwriter-${Math.random().toString(36).substring(2, 9)}`;

type TickData = {
  websiteId: string;
  regionId: string;
  status: 'UP' | 'DOWN';
  statusCode: number | null;
  responseTimeMs: number;
  errorMessage: string | null;
  checkedAt: Date;
  url?: string;
};

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

        if (!cert || !cert.valid_to) return resolve(null);

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

      socket.on('error', () => resolve(null));
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

function parseMessages(messages: StreamMessage<DBWriteEvent>[]): TickData[] {
  return messages.map(({ message }) => ({
    websiteId: message.websiteId,
    regionId: message.regionId,
    status: message.status as 'UP' | 'DOWN',
    statusCode: message.statusCode ? parseInt(message.statusCode) : null,
    responseTimeMs: parseInt(message.responseTimeMs),
    errorMessage: message.errorMessage || null,
    checkedAt: new Date(message.checkedAt),
    url: message.url,
  }));
}

function getLatestTickPerWebsite(ticks: TickData[]): Map<string, TickData> {
  const latestStatusMap = new Map<string, TickData>();
  for (const tick of ticks) {
    latestStatusMap.set(tick.websiteId, tick);
  }
  return latestStatusMap;
}

async function buildStatusAndIncidentOps(
  latestTicksMap: Map<string, TickData>,
  websiteMap: Map<string, { id: string; name: string; url: string }>
) {
  const ops: any[] = [];
  const alerts: AlertPayload[] = [];
  const websiteIds = Array.from(latestTicksMap.keys());

  const currentStatuses = await prismaclient.websiteStatusCurrent.findMany({
    where: { websiteId: { in: websiteIds } },
  });
  const currentStatusMap = new Map(currentStatuses.map(s => [s.websiteId, s]));

  const activeIncidents = await prismaclient.incident.findMany({
    where: { websiteId: { in: websiteIds }, resolvedAt: null },
  });
  const activeIncidentMap = new Map(activeIncidents.map(i => [i.websiteId, i]));

  for (const [websiteId, latestTick] of latestTicksMap.entries()) {
    const currentStatus = currentStatusMap.get(websiteId);
    const activeIncident = activeIncidentMap.get(websiteId);
    const website = websiteMap.get(websiteId);

    let consecutiveFails = 0;
    if (latestTick.status === 'DOWN') {
      consecutiveFails = (currentStatus?.consecutiveFails ?? 0) + 1;
    }

    ops.push(
      prismaclient.websiteStatusCurrent.upsert({
        where: { websiteId },
        create: {
          websiteId,
          currentStatus: latestTick.status,
          consecutiveFails,
          lastCheckedAt: latestTick.checkedAt,
          lastResponseTimeMs: latestTick.responseTimeMs,
        },
        update: {
          currentStatus: latestTick.status,
          consecutiveFails,
          lastCheckedAt: latestTick.checkedAt,
          lastResponseTimeMs: latestTick.responseTimeMs,
        },
      })
    );

    const previousStatus = currentStatus?.currentStatus ?? 'UNKNOWN';

    if (previousStatus !== 'DOWN' && latestTick.status === 'DOWN') {

      if (!activeIncident) {
        const reason = latestTick.errorMessage || `Status check failed with code ${latestTick.statusCode}`;
        ops.push(
          prismaclient.incident.create({
            data: {
              websiteId,
              startedAt: latestTick.checkedAt,
              reason,
            },
          })
        );
        if (website) {
          alerts.push({
            websiteId,
            websiteName: website.name,
            websiteUrl: website.url,
            eventType: 'DOWN',
            reason,
          });
        }
      }
    } else if (previousStatus === 'DOWN' && latestTick.status === 'UP') {

      if (activeIncident) {
        const resolvedAt = latestTick.checkedAt;
        const durationSeconds = Math.ceil((resolvedAt.getTime() - activeIncident.startedAt.getTime()) / 1000);
        ops.push(
          prismaclient.incident.update({
            where: { id: activeIncident.id },
            data: { resolvedAt, durationSeconds },
          })
        );
        if (website) {
          alerts.push({
            websiteId,
            websiteName: website.name,
            websiteUrl: website.url,
            eventType: 'RECOVERED',
          });
        }
      }
    }
  }

  return { ops, alerts };
}

async function buildSSLOps(
  latestTicksMap: Map<string, TickData>,
  websiteMap: Map<string, { id: string; name: string; url: string }>
) {
  const ops: any[] = [];
  const alerts: AlertPayload[] = [];

  const sslChecks = Array.from(latestTicksMap.values())
    .filter(tick => tick.url && tick.url.startsWith('https://'))
    .map(async tick => {
      const ssl = await getSSLCertDetails(tick.url!);
      return { websiteId: tick.websiteId, ssl };
    });

  const sslResults = await Promise.all(sslChecks);

  for (const { websiteId, ssl } of sslResults) {
    if (ssl) {
      ops.push(
        prismaclient.websiteSSLStatus.upsert({
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
        })
      );

      if (ssl.daysRemaining <= 14) {
        const website = websiteMap.get(websiteId);
        if (website) {
          alerts.push({
            websiteId,
            websiteName: website.name,
            websiteUrl: website.url,
            eventType: 'SSL_EXPIRING',
            daysRemaining: ssl.daysRemaining,
          });
        }
      }
    }
  }

  return { ops, alerts };
}

async function processBatch() {

  const messages = await xReadGroup<DBWriteEvent>(
    DB_WRITE_STREAM,
    REGION_ID,
    WORKER_ID,
    50 
  );

  if (!messages?.length) return;

  try {

    const ticksData = parseMessages(messages);
    const latestTicksMap = getLatestTickPerWebsite(ticksData);

    const websiteIds = Array.from(latestTicksMap.keys());
    const websites = await prismaclient.website.findMany({
      where: { id: { in: websiteIds } },
      select: { id: true, name: true, url: true }
    });
    const websiteMap = new Map(websites.map(w => [w.id, w]));

    const transactionOps: any[] = [];

    const cleanTicksData = ticksData.map(({ url, ...rest }) => rest);
    transactionOps.push(prismaclient.websiteTick.createMany({ data: cleanTicksData }));

    const statusResults = await buildStatusAndIncidentOps(latestTicksMap, websiteMap);
    transactionOps.push(...statusResults.ops);

    const sslResults = await buildSSLOps(latestTicksMap, websiteMap);
    transactionOps.push(...sslResults.ops);

    await prismaclient.$transaction(transactionOps);

    const allAlerts = [...statusResults.alerts, ...sslResults.alerts];
    for (const alert of allAlerts) {
      fireAlerts(alert).catch(err => console.error(`[${WORKER_ID}] Alert failed:`, err));
    }

    await xAckBulk(
      DB_WRITE_STREAM,
      REGION_ID,
      messages.map(({ id }) => id),
    );

    console.log(`[${WORKER_ID}] successfully bulk processed ${messages.length} checks`);
  } catch (err) {
    console.error(`[${WORKER_ID}] Error in processBatch:`, err);
  }
}

async function main() {
  console.log(`DB Writer ${WORKER_ID} starting in region ${REGION_ID}`);

  try {
    await prismaclient.region.upsert({
      where: { code: REGION_ID },
      create: { id: REGION_ID, code: REGION_ID, name: REGION_ID },
      update: {}
    });
    console.log(`Region ${REGION_ID} verified in DB`);
  } catch (err) {
    console.error(`Failed to verify region ${REGION_ID}:`, err);
  }

  await xCreateGroup(DB_WRITE_STREAM, REGION_ID);

  setInterval(() => {
    reclaimStuck(DB_WRITE_STREAM, REGION_ID, WORKER_ID).catch(console.error);
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
