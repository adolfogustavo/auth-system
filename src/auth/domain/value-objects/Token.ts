import { DomainError } from '../../../shared/domain/DomainError';

export class Token {
  private constructor(readonly value: string) {}

  static create(value: string): Token {
    if (!value || value.trim() === '') {
      throw DomainError.createValidation('Token cannot be empty');
    }
    return new Token(value);
  }
}
