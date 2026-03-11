import { DomainError } from '../../../shared/domain/DomainError';

export class Email {
  private constructor(readonly value: string) {}

  static create(value: string): Email {
    if (!value || !value.includes('@')) {
      throw DomainError.createValidation('Invalid email format');
    }
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toPrimitives(): string {
    return this.value;
  }
}
