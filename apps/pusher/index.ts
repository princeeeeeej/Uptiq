import { prismaclient } from 'store/client';
import { xAddBulk, CHECK_STREAM } from 'redisstream/client';
async function main() {
  const websites = await prismaclient.website.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      url: true,
    },
  });
  console.log(`Scheduling ${websites.length} websites`);
    await xAddBulk(
    CHECK_STREAM,
    websites.map((website) => ({
      id: website.id,
      url: website.url,
    })),
  );
}
main();
setInterval(main, 3 * 60 * 1000);
