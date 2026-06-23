import { xAck, xAckBulk, xReadGroup } from "redisstream/client";
import { prismaclient } from "store/client";

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) {
  throw new Error("Region not provided");
}

if (!WORKER_ID) {
  throw new Error("Worker not provided");
}

async function main() {
  console.log("worker started");

  while (1) {
    const response = await xReadGroup(REGION_ID, WORKER_ID);
    if (!response) {
      continue;
    }

    let promises = response.map(({ message }) =>
      fetchWebsite(message.url, message.id),
    );
    await Promise.all(promises);
    console.log(promises.length);

    xAckBulk(
      REGION_ID,
      response.map(({ id }) => id),
    );
  }
}

async function fetchWebsite(url: string, websiteId: string) {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    fetch(url)
      .then(async () => {
        const endTime = Date.now();
        console.log({
          REGION_ID,
          websiteId,
          regionType: typeof REGION_ID,
        });

        const region = await prismaclient.region.findUnique({
          where: {
            id: REGION_ID,
          },
        });

        console.log("Region found:", region);

        const website = await prismaclient.website.findUnique({
          where: {
            id: websiteId,
          },
        });
        await prismaclient.website_tick.create({
          data: {
            response_time_ms: endTime - startTime,
            status: "Up",
            region_id: REGION_ID,
            website_id: websiteId,
            created_at: new Date(),
          },
        });
        resolve();
      })
      .catch(async () => {
        const endTime = Date.now();
        await prismaclient.website_tick.create({
          data: {
            response_time_ms: endTime - startTime,
            status: "Down",
            region_id: REGION_ID,
            website_id: websiteId,
            created_at: new Date(),
          },
        });
        resolve();
      });
  });
}

main();
