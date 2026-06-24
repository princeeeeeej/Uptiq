import {
  xAckBulk,
  xCreateGroup,
  xReadGroup,
  reclaimStuck,
  CHECK_STREAM,
  type WebsiteEvent,
} from 'redisstream/client';
import { prismaclient } from 'store/client';

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) throw new Error('REGION_ID not provided');
if (!WORKER_ID) throw new Error('WORKER_ID not provided');

async function fetchWebsite(url: string, websiteId: string) {
  const startTime = Date.now();

  try {
    const res = await fetch(url);
    const responseTimeMs = Date.now() - startTime;
    console.log({
      websiteId,
      url,
    });

    await prismaclient.websiteTick.create({
      data: {
        websiteId,
        regionId: REGION_ID,
        status: res.ok ? 'UP' : 'DOWN',
        statusCode: res.status,
        responseTimeMs,
        checkedAt: new Date(),
      },
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;

    await prismaclient.websiteTick.create({
      data: {
        websiteId,
        regionId: REGION_ID,
        status: 'DOWN',
        responseTimeMs,
        errorMessage: err?.message ?? 'Unknown error',
        checkedAt: new Date(),
      },
    });
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
