import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:8080';

let authToken: string;
let createdWebsiteId: string;

test.describe.serial('API — auth endpoints', () => {
  const testUser = `api_test_${Date.now()}`;
  const testPass = 'securepassword123';

  test('POST /user/signup creates a new user', async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signup`, {
      data: { username: testUser, password: testPass },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty('id');
  });

  test('POST /user/signup rejects duplicate username', async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signup`, {
      data: { username: testUser, password: testPass },
    });
    expect(res.status()).toBe(409);

    const body = await res.json();
    expect(body.message).toMatch(/already exists/i);
  });

  test('POST /user/signup rejects invalid input', async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signup`, {
      data: { username: 123 },  // missing password, wrong type
    });
    expect(res.status()).toBe(400);
  });

  test('POST /user/signin returns JWT for valid credentials', async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signin`, {
      data: { username: testUser, password: testPass },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('jwt');
    expect(typeof body.jwt).toBe('string');

    authToken = body.jwt;
  });

  test('POST /user/signin rejects wrong password', async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signin`, {
      data: { username: testUser, password: 'wrong' },
    });
    expect(res.status()).toBe(403);
  });

  test('POST /user/signin rejects non-existent user', async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signin`, {
      data: { username: 'does_not_exist_xyz', password: 'anything' },
    });
    expect(res.status()).toBe(403);
  });

  test('GET /user/me returns user info with valid token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('username', testUser);
  });

  test('GET /user/me rejects request without token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/user/me`);
    expect(res.status()).toBe(403);
  });
});

test.describe.serial('API — website CRUD', () => {
  // login first to get a token
  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signin`, {
      data: {
        username: process.env.TEST_USER_EMAIL || 'testuser',
        password: process.env.TEST_USER_PASSWORD || 'testpassword123',
      },
    });
    const body = await res.json();
    authToken = body.jwt;
  });

  test('POST /website creates a new website', async ({ request }) => {
    const res = await request.post(`${API_BASE}/website`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        name: 'API Test Site',
        url: 'https://api-test-example.com',
        slug: `api-test-${Date.now()}`,
      },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty('id');
    createdWebsiteId = body.id;
  });

  test('POST /website rejects missing fields', async ({ request }) => {
    const res = await request.post(`${API_BASE}/website`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { name: 'Incomplete' },  // missing url and slug
    });
    expect(res.status()).toBe(400);
  });

  test('POST /website rejects unauthenticated request', async ({ request }) => {
    const res = await request.post(`${API_BASE}/website`, {
      data: { name: 'Unauthed', url: 'https://x.com', slug: 'x' },
    });
    expect(res.status()).toBe(403);
  });

  test('GET /websites returns array of websites', async ({ request }) => {
    const res = await request.get(`${API_BASE}/websites`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('websites');
    expect(Array.isArray(body.websites)).toBe(true);
    expect(body.websites.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /website/:id returns website details', async ({ request }) => {
    const res = await request.get(`${API_BASE}/website/${createdWebsiteId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.name).toBe('API Test Site');
    expect(body.url).toBe('https://api-test-example.com');
    expect(body).toHaveProperty('currentStatus');
  });

  test('GET /website/:id/ticks returns tick history', async ({ request }) => {
    const res = await request.get(`${API_BASE}/website/${createdWebsiteId}/ticks`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('ticks');
    expect(Array.isArray(body.ticks)).toBe(true);
  });

  test('GET /website/:id returns 404 for non-existent website', async ({ request }) => {
    const res = await request.get(`${API_BASE}/website/non-existent-id-xyz`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /website/:id removes the website', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/website/${createdWebsiteId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    // verify it's gone
    const check = await request.get(`${API_BASE}/website/${createdWebsiteId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(check.status()).toBe(404);
  });
});

test.describe.serial('API — incidents', () => {
  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signin`, {
      data: {
        username: process.env.TEST_USER_EMAIL || 'testuser',
        password: process.env.TEST_USER_PASSWORD || 'testpassword123',
      },
    });
    const body = await res.json();
    authToken = body.jwt;
  });

  test('GET /incidents returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/incidents`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('incidents');
    expect(Array.isArray(body.incidents)).toBe(true);
  });
});

test.describe.serial('API — alert channels', () => {
  let channelId: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_BASE}/user/signin`, {
      data: {
        username: process.env.TEST_USER_EMAIL || 'testuser',
        password: process.env.TEST_USER_PASSWORD || 'testpassword123',
      },
    });
    const body = await res.json();
    authToken = body.jwt;
  });

  test('POST /alert-channels creates a channel', async ({ request }) => {
    const res = await request.post(`${API_BASE}/alert-channels`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { email: 'alerts@example.com' },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty('id');
    channelId = body.id;
  });

  test('POST /alert-channels rejects missing email', async ({ request }) => {
    const res = await request.post(`${API_BASE}/alert-channels`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('GET /alert-channels returns list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/alert-channels`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('channels');
    expect(Array.isArray(body.channels)).toBe(true);
  });

  test('DELETE /alert-channels/:id removes a channel', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/alert-channels/${channelId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('DELETE /alert-channels/:id returns 404 for non-existent', async ({ request }) => {
    const res = await request.delete(`${API_BASE}/alert-channels/non-existent-id`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(404);
  });
});
