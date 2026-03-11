import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';
import { OtpNotifier } from '../../application/ports/OtpNotifier';

describe('Auth API', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let server: ReturnType<typeof createServer>;
  let lastOtp: string | null;

  beforeAll(async () => {
    mongo = await createTestMongo();
    Factory.setMongoClient(mongo.client());
    process.env.JWT_SECRET = 'e2e-test-secret';
    lastOtp = null;
    const capturingNotifier: OtpNotifier = {
      notify: async (_email, otp) => {
        lastOtp = otp.toPrimitives();
      },
    };
    Factory.setOtpNotifier(capturingNotifier);
    server = createServer();
  });

  afterAll(() => mongo.stop());
  beforeEach(async () => {
    await mongo.clean();
    lastOtp = null;
  });

  describe('POST /auth/register', () => {
    it('registers a new user and returns id and email', async () => {
      const response = await request(server).post('/auth/register').send({ email: 'user@example.com' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe('user@example.com');
    });

    it('returns 422 when email already exists', async () => {
      await request(server).post('/auth/register').send({ email: 'same@example.com' });
      const response = await request(server).post('/auth/register').send({ email: 'same@example.com' });

      expect(response.status).toBe(422);
      expect(response.body.error).toContain('already registered');
    });
  });

  describe('POST /auth/login/request-otp', () => {
    it('returns 404 when user does not exist', async () => {
      const response = await request(server).post('/auth/login/request-otp').send({ email: 'unknown@example.com' });

      expect(response.status).toBe(404);
    });

    it('returns 200 and sends OTP when user exists', async () => {
      await request(server).post('/auth/register').send({ email: 'user@example.com' });
      const response = await request(server).post('/auth/login/request-otp').send({ email: 'user@example.com' });

      expect(response.status).toBe(200);
      expect(lastOtp).toMatch(/^\d{6}$/);
    });
  });

  describe('POST /auth/login/verify-otp', () => {
    it('returns 404 when no OTP session exists', async () => {
      const response = await request(server)
        .post('/auth/login/verify-otp')
        .send({ email: 'no-session@example.com', otp: '123456' });

      expect(response.status).toBe(404);
    });

    it('returns 200 and token when OTP is correct', async () => {
      await request(server).post('/auth/register').send({ email: 'verify-ok@example.com' });
      await request(server).post('/auth/login/request-otp').send({ email: 'verify-ok@example.com' });
      const otp = lastOtp ?? '000000';
      const response = await request(server)
        .post('/auth/login/verify-otp')
        .send({ email: 'verify-ok@example.com', otp });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('returns 422 when OTP is incorrect', async () => {
      await request(server).post('/auth/register').send({ email: 'verify-bad@example.com' });
      await request(server).post('/auth/login/request-otp').send({ email: 'verify-bad@example.com' });
      const response = await request(server)
        .post('/auth/login/verify-otp')
        .send({ email: 'verify-bad@example.com', otp: '000000' });

      expect(response.status).toBe(422);
    });
  });
});
