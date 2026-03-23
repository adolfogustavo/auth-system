import { DomainError } from '../../shared/domain/DomainError';
import { Id } from '../../shared/domain/value-objects/Id';
import { User } from '../domain/entities/User';
import { UserRepository } from '../domain/repositories/UserRepository';
import { Email } from '../domain/value-objects/Email';

interface RegisterUserInput {
  email: string;
}

interface RegisterUserOutput {
  id: string;
  email: string;
}

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email);
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw DomainError.createValidation('Email already registered');
    }
    const user = User.create(Id.generate(), email);
    await this.userRepository.save(user);
    return user.toPrimitives();
  }
}
