import { MongoOtpSessionRepository } from '../../infrastructure/adapters/MongoOtpSessionRepository';
import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';

describe('The MongoOtpSessionRepository', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let repository: MongoOtpSessionRepository;

  const email = Email.create('user@example.com');
  const otp = Otp.create('123456');
  const now = new Date('2026-01-01T10:00:00.000Z');

  beforeAll(async () => {
    mongo = await createTestMongo();
    repository = new MongoOtpSessionRepository(mongo.db());
  });

  afterAll(() => mongo.stop());
  beforeEach(() => mongo.clean());

  it('saves and finds an OTP session by email', async () => {
    const session = OtpSession.create(email, otp, now);

    await repository.save(session);
    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isSome()).toBe(true);
    const primitives = retrieved.fold(
      () => null,
      (s) => s.toPrimitives()
    );
    expect(primitives?.email).toBe('user@example.com');
    expect(primitives?.otp).toBe('123456');
  });

  it('finds nothing when session does not exist', async () => {
    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isNone()).toBe(true);
  });

  it('deletes a session by email', async () => {
    const session = OtpSession.create(email, otp, now);
    await repository.save(session);

    await repository.deleteByEmail(email);
    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isNone()).toBe(true);
  });

  it('updates existing session', async () => {
    const session = OtpSession.create(email, otp, now);
    await repository.save(session);
    session.incrementAttempts();
    await repository.save(session);

    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isSome()).toBe(true);
    const primitives = retrieved.fold(
      () => null,
      (s) => s.toPrimitives()
    );
    expect(primitives?.failedAttempts).toBe(1);
  });

  it('preserves lock status', async () => {
    const session = OtpSession.create(email, otp, now);
    session.lock(now);
    await repository.save(session);

    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isSome()).toBe(true);
    expect(
      retrieved.fold(
        () => false,
        (s) => s.isLocked(now)
      )
    ).toBe(true);
  });
});
