import { DomainError } from '../../../shared/domain/DomainError';

export class Otp {
  private constructor(readonly value: string) {}

  static create(value: string): Otp {
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(value)) {
      throw DomainError.createValidation('OTP must be 6 numeric digits');
    }
    return new Otp(value);
  }

  equals(other: Otp): boolean {
    return this.value === other.value;
  }
}
