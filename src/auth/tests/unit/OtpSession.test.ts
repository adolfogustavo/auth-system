import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';

describe('The OtpSession', () => {
  const fiveMinutesMs = 5 * 60 * 1000;
  const tenMinutesMs = 10 * 60 * 1000;
  const baseTime = new Date('2026-01-01T10:00:00.000Z');

  it('creates a session with email, otp and createdAt', () => {
    const email = Email.create('user@example.com');
    const otp = Otp.create('123456');

    const session = OtpSession.create(email, otp, baseTime);
    const primitives = session.toPrimitives();

    expect(primitives.email).toBe('user@example.com');
    expect(primitives.otp).toBe('123456');
    expect(primitives.createdAt).toBe(baseTime.toISOString());
  });

  it('verifies as successful when OTP matches', () => {
    const email = Email.create('u@e.com');
    const otp = Otp.create('123456');
    const session = OtpSession.create(email, otp, baseTime);

    const result = session.verify(Otp.create('123456'), baseTime);

    expect(result).toBe(true);
  });

  it('verifies as failed when OTP does not match and records one failed attempt', () => {
    const email = Email.create('u@e.com');
    const otp = Otp.create('123456');
    const session = OtpSession.create(email, otp, baseTime);

    const result = session.verify(Otp.create('654321'), baseTime);

    expect(result).toBe(false);
    expect(session.toPrimitives().failedAttempts).toBe(1);
  });

  it('throws when session is expired', () => {
    const email = Email.create('u@e.com');
    const otp = Otp.create('123456');
    const session = OtpSession.create(email, otp, baseTime);
    const afterExpiry = new Date(baseTime.getTime() + fiveMinutesMs + 1);

    expect(() => session.verify(Otp.create('123456'), afterExpiry)).toThrow('OTP has expired');
  });

  it('blocks session after third failed attempt', () => {
    const email = Email.create('u@e.com');
    const otp = Otp.create('123456');
    const session = OtpSession.create(email, otp, baseTime);

    session.verify(Otp.create('000000'), baseTime);
    session.verify(Otp.create('000000'), baseTime);
    session.verify(Otp.create('000000'), baseTime);

    expect(session.toPrimitives().blockedAt).toBeDefined();
    expect(() => session.verify(Otp.create('123456'), baseTime)).toThrow('OTP session is blocked');
  });

  it('throws when session is blocked and verify is attempted', () => {
    const email = Email.create('u@e.com');
    const otp = Otp.create('123456');
    const session = OtpSession.create(email, otp, baseTime);
    session.verify(Otp.create('000000'), baseTime);
    session.verify(Otp.create('111111'), baseTime);
    session.verify(Otp.create('222222'), baseTime);

    const duringBlock = new Date(baseTime.getTime() + 1000);

    expect(() => session.verify(Otp.create('123456'), duringBlock)).toThrow('OTP session is blocked');
  });

  it('allows new request when block has expired', () => {
    const email = Email.create('u@e.com');
    const otp = Otp.create('123456');
    const session = OtpSession.create(email, otp, baseTime);
    session.verify(Otp.create('000000'), baseTime);
    session.verify(Otp.create('111111'), baseTime);
    session.verify(Otp.create('222222'), baseTime);
    const afterBlockExpiry = new Date(baseTime.getTime() + tenMinutesMs + 1);

    const isBlocked = session.isBlocked(afterBlockExpiry);

    expect(isBlocked).toBe(false);
  });
});
