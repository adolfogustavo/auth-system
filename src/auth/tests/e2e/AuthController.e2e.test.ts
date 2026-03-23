import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';
import { Routes } from '../../../shared/infrastructure/routes';

describe('Auth Flow', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key';
    mongo = await createTestMongo();
    Factory.setMongoClient(mongo.client());
    server = createServer();
  });

  afterAll(() => mongo.stop());
  beforeEach(() => mongo.clean());

  describe('POST /auth/register', () => {
    it('registers a new user', async () => {
      const response = await request(server).post(Routes.AuthRegister).send({ email: 'user@example.com' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe('user@example.com');
    });

    it('rejects duplicate email', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@example.com' });

      const response = await request(server).post(Routes.AuthRegister).send({ email: 'user@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });

    it('rejects invalid email format', async () => {
      const response = await request(server).post(Routes.AuthRegister).send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@example.com' });
    });

    it('sends OTP for registered user', async () => {
      const response = await request(server).post(Routes.AuthLogin).send({ email: 'user@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('OTP sent');
    });

    it('rejects login for unregistered user', async () => {
      const response = await request(server).post(Routes.AuthLogin).send({ email: 'unknown@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('POST /auth/verify', () => {
    it('rejects verification without OTP session', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@example.com' });

      const response = await request(server).post(Routes.AuthVerify).send({ email: 'user@example.com', otp: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No OTP session found');
    });

    it('rejects invalid OTP', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@example.com' });
      await request(server).post(Routes.AuthLogin).send({ email: 'user@example.com' });

      const response = await request(server).post(Routes.AuthVerify).send({ email: 'user@example.com', otp: '000000' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid OTP');
    });
  });
});
