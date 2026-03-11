import { DomainError } from '../../../shared/domain/DomainError';
import { Email } from '../value-objects/Email';
import { Otp } from '../value-objects/Otp';

const otpValidityMs = 5 * 60 * 1000;
const blockDurationMs = 10 * 60 * 1000;
const maxFailedAttempts = 3;

export class OtpSession {
  private constructor(
    private readonly email: Email,
    private readonly otp: Otp,
    private readonly createdAt: Date,
    private failedAttempts: number,
    private blockedAt: Date | null
  ) {}

  static create(email: Email, otp: Otp, createdAt: Date): OtpSession {
    return new OtpSession(email, otp, createdAt, 0, null);
  }

  verify(otp: Otp, now: Date): boolean {
    if (this.isBlocked(now)) {
      throw DomainError.createValidation('OTP session is blocked');
    }
    if (this.isExpired(now)) {
      throw DomainError.createValidation('OTP has expired');
    }
    if (this.otp.equals(otp)) {
      return true;
    }
    this.recordFailedAttempt(now);
    return false;
  }

  isExpired(now: Date): boolean {
    return now.getTime() > this.createdAt.getTime() + otpValidityMs;
  }

  isBlocked(now: Date): boolean {
    if (this.blockedAt === null) {
      return false;
    }
    return now.getTime() < this.blockedAt.getTime() + blockDurationMs;
  }

  private recordFailedAttempt(now: Date): void {
    this.failedAttempts += 1;
    if (this.failedAttempts >= maxFailedAttempts) {
      this.blockedAt = now;
    }
  }

  toPrimitives(): {
    email: string;
    otp: string;
    createdAt: string;
    failedAttempts: number;
    blockedAt: string | null;
  } {
    return {
      email: this.email.toPrimitives(),
      otp: this.otp.toPrimitives(),
      createdAt: this.createdAt.toISOString(),
      failedAttempts: this.failedAttempts,
      blockedAt: this.blockedAt?.toISOString() ?? null,
    };
  }
}
