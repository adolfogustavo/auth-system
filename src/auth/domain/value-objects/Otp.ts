import crypto from 'crypto';
import { DomainError } from '../../../shared/domain/DomainError';

const otpLength = 6;
const numericOnly = /^\d{6}$/;

export class Otp {
  private constructor(readonly value: string) {}

  static create(value: string): Otp {
    if (!value || !numericOnly.test(value)) {
      throw DomainError.createValidation('OTP must be 6 numeric digits');
    }
    return new Otp(value);
  }

  static generate(): Otp {
    const digits = crypto.randomInt(0, 1_000_000).toString().padStart(otpLength, '0');
    return new Otp(digits);
  }

  equals(other: Otp): boolean {
    return this.value === other.value;
  }

  toPrimitives(): string {
    return this.value;
  }
}
