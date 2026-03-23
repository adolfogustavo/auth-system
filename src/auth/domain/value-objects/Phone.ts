import { DomainError } from '../../../shared/domain/DomainError';

export class Phone {
  private constructor(readonly value: string) {}

  static create(value: string): Phone {
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(value)) {
      throw DomainError.createValidation('Invalid phone format');
    }
    return new Phone(value);
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
