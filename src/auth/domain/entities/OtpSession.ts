import { Email } from '../value-objects/Email';
import { Otp } from '../value-objects/Otp';

interface OtpSessionPrimitives {
  email: string;
  otp: string;
  expiresAt: string;
  failedAttempts: number;
  lockedUntil: string | null;
}

const otpValidityMinutes = 5;
const maxFailedAttempts = 3;
const lockoutMinutes = 10;
const minutesToMilliseconds = 60 * 1000;

export class OtpSession {
  private constructor(
    readonly email: Email,
    private readonly otp: Otp,
    private readonly expiresAt: Date,
    private failedAttempts: number,
    private lockedUntil: Date | null
  ) {}

  static create(email: Email, otp: Otp, createdAt: Date): OtpSession {
    const expiresAt = new Date(createdAt.getTime() + otpValidityMinutes * minutesToMilliseconds);
    return new OtpSession(email, otp, expiresAt, 0, null);
  }

  static fromPrimitives(primitives: OtpSessionPrimitives): OtpSession {
    return new OtpSession(
      Email.create(primitives.email),
      Otp.create(primitives.otp),
      new Date(primitives.expiresAt),
      primitives.failedAttempts,
      primitives.lockedUntil ? new Date(primitives.lockedUntil) : null
    );
  }

  isExpired(currentTime: Date): boolean {
    return currentTime > this.expiresAt;
  }

  isLocked(currentTime: Date): boolean {
    if (!this.lockedUntil) {
      return false;
    }
    return currentTime < this.lockedUntil;
  }

  incrementAttempts(): void {
    this.failedAttempts++;
  }

  hasExceededMaxAttempts(): boolean {
    return this.failedAttempts >= maxFailedAttempts;
  }

  lock(currentTime: Date): void {
    this.lockedUntil = new Date(currentTime.getTime() + lockoutMinutes * minutesToMilliseconds);
  }

  validateOtp(otpToValidate: Otp): boolean {
    return this.otp.equals(otpToValidate);
  }

  toPrimitives(): OtpSessionPrimitives {
    return {
      email: this.email.value,
      otp: this.otp.value,
      expiresAt: this.expiresAt.toISOString(),
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil ? this.lockedUntil.toISOString() : null,
    };
  }
}
