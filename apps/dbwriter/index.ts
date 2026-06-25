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

const REGION_ID = process.env.REGION_ID || 'global-writer';
const WORKER_ID = process.env.WORKER_ID || `dbwriter-${Math.random().toString(36).substring(2, 9)}`;

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks the SSL certificate of a given HTTPS URL and returns its details.
 */
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

/**
 * Parses raw Redis stream string records into typed JavaScript objects.
 */
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

/**
 * If a single website was checked multiple times in a single batch,
 * we only want to keep the most recent check to update its "current status".
 */
function getLatestTickPerWebsite(ticks: TickData[]): Map<string, TickData> {
  const latestStatusMap = new Map<string, TickData>();
  for (const tick of ticks) {
    latestStatusMap.set(tick.websiteId, tick);
  }
  return latestStatusMap;
}

/**
 * Compares the new tick against the database's current status and generates
 * the necessary Prisma operations (upsert status, create/resolve incidents).
 */
async function buildStatusAndIncidentOps(latestTicksMap: Map<string, TickData>) {
  const ops: any[] = [];
  const websiteIds = Array.from(latestTicksMap.keys());
  
  // 1. Fetch current state from DB
  const currentStatuses = await prismaclient.websiteStatusCurrent.findMany({
    where: { websiteId: { in: websiteIds } },
  });
  const currentStatusMap = new Map(currentStatuses.map(s => [s.websiteId, s]));

  const activeIncidents = await prismaclient.incident.findMany({
    where: { websiteId: { in: websiteIds }, resolvedAt: null },
  });
  const activeIncidentMap = new Map(activeIncidents.map(i => [i.websiteId, i]));

  // 2. Build operations for each website
  for (const [websiteId, latestTick] of latestTicksMap.entries()) {
    const currentStatus = currentStatusMap.get(websiteId);
    const activeIncident = activeIncidentMap.get(websiteId);
    
    // Calculate consecutive fails
    let consecutiveFails = 0;
    if (latestTick.status === 'DOWN') {
      consecutiveFails = (currentStatus?.consecutiveFails ?? 0) + 1;
    }

    // Queue: Update current status
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

    // Queue: Incident logic
    const previousStatus = currentStatus?.currentStatus ?? 'UNKNOWN';

    if (previousStatus !== 'DOWN' && latestTick.status === 'DOWN') {
      // Site just went down -> Create incident
      if (!activeIncident) {
        ops.push(
          prismaclient.incident.create({
            data: {
              websiteId,
              startedAt: latestTick.checkedAt,
              reason: latestTick.errorMessage || `Status check failed with code ${latestTick.statusCode}`,
            },
          })
        );
      }
    } else if (previousStatus === 'DOWN' && latestTick.status === 'UP') {
      // Site just came back up -> Resolve incident
      if (activeIncident) {
        const resolvedAt = latestTick.checkedAt;
        const durationSeconds = Math.ceil((resolvedAt.getTime() - activeIncident.startedAt.getTime()) / 1000);
        ops.push(
          prismaclient.incident.update({
            where: { id: activeIncident.id },
            data: { resolvedAt, durationSeconds },
          })
        );
      }
    }
  }

  return ops;
}

/**
 * Checks SSL for all HTTPS websites in the batch concurrently,
 * and generates the necessary Prisma upsert operations.
 */
async function buildSSLOps(latestTicksMap: Map<string, TickData>) {
  const ops: any[] = [];
  
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
    }
  }

  return ops;
}

// ============================================================================
// Main Processing Loop
// ============================================================================

async function processBatch() {
  // 1. Read a batch of jobs from Redis
  const messages = await xReadGroup<DBWriteEvent>(
    DB_WRITE_STREAM,
    REGION_ID,
    WORKER_ID,
    50 // Max messages per batch
  );

  if (!messages?.length) return;

  try {
    // 2. Parse and deduplicate the data
    const ticksData = parseMessages(messages);
    const latestTicksMap = getLatestTickPerWebsite(ticksData);

    // 3. Build all database operations (inserts, upserts, updates)
    const transactionOps: any[] = [];
    
    // - Add the raw ticks (one for every check)
    // NOTE: We don't need URL in the database tick, so we can map it out, 
    // or rely on Prisma to ignore extra fields if it's strict, but it's safer to map.
    const cleanTicksData = ticksData.map(({ url, ...rest }) => rest);
    transactionOps.push(prismaclient.websiteTick.createMany({ data: cleanTicksData }));

    // - Add status updates and incident transitions
    const statusAndIncidentOps = await buildStatusAndIncidentOps(latestTicksMap);
    transactionOps.push(...statusAndIncidentOps);

    // - Add SSL certificate updates
    const sslOps = await buildSSLOps(latestTicksMap);
    transactionOps.push(...sslOps);

    // 4. Execute all operations atomically in a single transaction
    await prismaclient.$transaction(transactionOps);
    
    // 5. Acknowledge the processed messages so they aren't read again
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

  await xCreateGroup(DB_WRITE_STREAM, REGION_ID);

  // Automatically retry jobs that crashed midway through processing
  setInterval(() => {
    reclaimStuck(DB_WRITE_STREAM, REGION_ID, WORKER_ID).catch(console.error);
  }, 30_000);

  // Continuous polling loop
  while (true) {
    try {
      await processBatch();
    } catch (err) {
      console.error('processBatch error:', err);
    }
  }
}

main();
