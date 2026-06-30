import { prismaclient } from 'store/client';
import { xAdd, DB_WRITE_STREAM } from 'redisstream/client';

async function main() {
  console.log('🌱 Setting up test data...');
  
  // 1. Create a dummy user
  const user = await prismaclient.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      password: 'dummy_password', // Mock password for test
    }
  });
  console.log(`✅ User created: ${user.id}`);

  // 2. Create a test alert channel
  // Instead of upserting by ID which might be uuid, just create if it doesn't exist
  let channel = await prismaclient.alertChannel.findFirst({
    where: { userId: user.id, type: 'EMAIL' }
  });

  if (!channel) {
    channel = await prismaclient.alertChannel.create({
      data: {
        userId: user.id,
        type: 'EMAIL',
        config: { to: 'success@simulator.amazonses.com' }, // Use a safe test email or your own
        isActive: true,
      }
    });
  }
  console.log(`✅ Alert Channel ready: ${channel.id}`);

  // 3. Create a test website
  const website = await prismaclient.website.upsert({
    where: { slug: 'test-down-site' },
    update: {},
    create: {
      userId: user.id,
      name: 'Test Down Site',
      url: 'https://test-down-site.com',
      slug: 'test-down-site'
    }
  });
  console.log(`✅ Website created: ${website.id}`);

  // 3.5 Create a test region
  const region = await prismaclient.region.upsert({
    where: { code: 'local-test' },
    update: {},
    create: {
      code: 'local-test',
    name: 'Local Test Region'
    }
  });
  console.log(`✅ Region created: ${region.id}`);

  // 4. Publish a DOWN event to Redis stream
  console.log('📡 Publishing DOWN event to Redis...');
  await xAdd(DB_WRITE_STREAM, {
    websiteId: website.id,
    regionId: region.id,
    url: website.url,
    status: 'DOWN',
    statusCode: '500',
    responseTimeMs: '120',
    errorMessage: 'Simulated 500 Internal Server Error',
    checkedAt: new Date().toISOString(),
  });
  console.log('✅ DOWN event published to DB_WRITE_STREAM');

  console.log('\n🚀 Now start dbwriter (e.g. `bun run index.ts`) and watch the logs!');
  process.exit(0);
}

main().catch(console.error);
