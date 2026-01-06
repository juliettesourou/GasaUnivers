const request = require('supertest');
const mongoose = require('mongoose');

// ensure test DB is used
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gasaunivers_test';

let app;

/**
 * Waits until mongoose connection is established.
 * @param {number} timeout - The amount of time to wait in milliseconds.
 * @throws {Error} - If the timeout is reached without establishing a connection.
 * @returns {Promise<void>} - A promise resolved when the connection is established.
 */
const waitForMongoose = async (timeout = 10000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      return;
    }
    // small delay
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Timed out waiting for mongoose connection');
};

beforeAll(async () => {
  // require app after setting MONGO_URI
  app = require('../src/index');
  // wait until mongoose connection is established by the app
  await waitForMongoose(10000);
  // clear test collections
  const db = mongoose.connection.db;
  await db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth and Promotions API', () => {
  let token;

  test('register → login → create promotion → list promotions', async () => {
    // register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Admin', email: 'test-admin@example.com', password: 'Admin123!', role: 'directeur' })
      .expect(201);

    // login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-admin@example.com', password: 'Admin123!' })
      .expect(200);

    token = loginRes.body.token;
    expect(token).toBeTruthy();

    // create promotion
    const promoRes = await request(app)
      .post('/api/promotions')
      .set('Authorization', `Bearer ${token}`)
      .send({ label: 'Promo Test 2026', year: 2026 })
      .expect(201);

    expect(promoRes.body).toMatchObject({ label: 'Promo Test 2026', year: 2026 });

    // list promotions
    const listRes = await request(app)
      .get('/api/promotions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
  });

  test('admin creates formateur → formateur can login', async () => {
    // ensure admin token exists (if not from previous test, create/login admin)
    if (!token) {
      await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@example.com', password: 'Admin123!', role: 'directeur' }).expect(201);
      const loginRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'Admin123!' }).expect(200);
      token = loginRes.body.token;
    }

    const formateurEmail = 'trainer@example.com';
    const formateurPwd = 'Trainer123!';

    // create formateur via admin endpoint
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Trainer User', email: formateurEmail, password: formateurPwd, role: 'formateur' })
      .expect(201);

    expect(createRes.body).toMatchObject({ email: formateurEmail.toLowerCase(), role: 'formateur' });

    // login with formateur credentials
    const fLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: formateurEmail, password: formateurPwd })
      .expect(200);

    expect(fLoginRes.body).toHaveProperty('token');
    expect(fLoginRes.body.user).toMatchObject({ role: 'formateur' });
  });
});
