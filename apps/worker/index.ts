import {
  xAckBulk,
  xCreateGroup,
  xReadGroup,
  reclaimStuck,
  CHECK_STREAM,
  DB_WRITE_STREAM,
  xAddBulk,
  type WebsiteEvent,
} from 'redisstream/client';

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) throw new Error('REGION_ID not provided');
if (!WORKER_ID) throw new Error('WORKER_ID not provided');

async function fetchWebsite(url: string, websiteId: string) {
  const startTime = Date.now();
  const checkedAt = new Date().toISOString();

  try {
    const res = await fetch(url);
    const responseTimeMs = Date.now() - startTime;
    console.log({
      websiteId,
      url,
      status: res.ok ? 'UP' : 'DOWN',
      responseTimeMs
    });

    return {
      websiteId,
      regionId: REGION_ID,
      url,
      status: res.ok ? 'UP' : 'DOWN',
      statusCode: res.status.toString(),
      responseTimeMs: responseTimeMs.toString(),
      errorMessage: '',
      checkedAt,
    };
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    console.error({
      websiteId,
      url,
      status: 'DOWN',
      responseTimeMs,
      error: err?.message
    });

    return {
      websiteId,
      regionId: REGION_ID,
      url,
      status: 'DOWN',
      statusCode: '',
      responseTimeMs: responseTimeMs.toString(),
      errorMessage: err?.message ?? 'Unknown error',
      checkedAt,
    };
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

  // 1. Fetch all websites concurrently
  const checkResults = await Promise.all(
    messages.map(({ message }) => fetchWebsite(message.url, message.id)),
  );

  // 2. Push all results to the DB writer stream
  await xAddBulk(
    DB_WRITE_STREAM,
    checkResults as unknown as Record<string, string>[]
  );

  // 3. Acknowledge original jobs
  await xAckBulk(
    CHECK_STREAM,
    REGION_ID,
    messages.map(({ id }) => id),
  );

  console.log(`[${WORKER_ID}] processed and queued ${messages.length} checks for DB writing`);
}

async function main() {
  console.log(`Worker ${WORKER_ID} starting in region ${REGION_ID}`);

  await xCreateGroup(CHECK_STREAM, REGION_ID);
  await xCreateGroup(DB_WRITE_STREAM, REGION_ID);

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
