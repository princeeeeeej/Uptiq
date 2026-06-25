import { prismaclient } from 'store/client';

async function main() {
  const usa = await prismaclient.region.upsert({
    where: { code: 'usa' },
    create: {
      code: 'usa',
      name: 'USA',
    },
    update: {}
  });
  console.log("USA:", usa);
}

main().catch(console.error);
