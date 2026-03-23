import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';

describe('The OtpSession', () => {
  const email = Email.create('user@example.com');
  const otp = Otp.create('123456');
  const now = new Date('2026-01-01T10:00:00.000Z');
  const fiveMinutesLater = new Date('2026-01-01T10:05:00.000Z');
  const sixMinutesLater = new Date('2026-01-01T10:06:00.000Z');
  const elevenMinutesLater = new Date('2026-01-01T10:11:00.000Z');

  it('stores the provided email, otp and expiration', () => {
    const session = OtpSession.create(email, otp, now);
    const primitives = session.toPrimitives();

    expect(primitives.email).toBe('user@example.com');
    expect(primitives.otp).toBe('123456');
    expect(primitives.failedAttempts).toBe(0);
    expect(primitives.lockedUntil).toBeNull();
  });

  it('is not expired when checked before expiration time', () => {
    const session = OtpSession.create(email, otp, now);

    expect(session.isExpired(fiveMinutesLater)).toBe(false);
  });

  it('is expired when checked after expiration time', () => {
    const session = OtpSession.create(email, otp, now);

    expect(session.isExpired(sixMinutesLater)).toBe(true);
  });

  it('is not locked when just created', () => {
    const session = OtpSession.create(email, otp, now);

    expect(session.isLocked(now)).toBe(false);
  });

  it('increments failed attempts', () => {
    const session = OtpSession.create(email, otp, now);

    session.incrementAttempts();
    session.incrementAttempts();

    expect(session.toPrimitives().failedAttempts).toBe(2);
  });

  it('locks the session after 3 failed attempts', () => {
    const session = OtpSession.create(email, otp, now);

    session.incrementAttempts();
    session.incrementAttempts();
    session.incrementAttempts();

    expect(session.hasExceededMaxAttempts()).toBe(true);
  });

  it('remains locked during lockout period', () => {
    const session = OtpSession.create(email, otp, now);
    session.lock(now);

    expect(session.isLocked(fiveMinutesLater)).toBe(true);
  });

  it('is no longer locked after lockout period expires', () => {
    const session = OtpSession.create(email, otp, now);
    session.lock(now);

    expect(session.isLocked(elevenMinutesLater)).toBe(false);
  });

  it('validates OTP correctly', () => {
    const session = OtpSession.create(email, otp, now);
    const correctOtp = Otp.create('123456');
    const wrongOtp = Otp.create('654321');

    expect(session.validateOtp(correctOtp)).toBe(true);
    expect(session.validateOtp(wrongOtp)).toBe(false);
  });
});
