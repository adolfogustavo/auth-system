import { User } from '../domain/entities/User';
import { UserRepository } from '../domain/repositories/UserRepository';
import { Id } from '../../shared/domain/value-objects/Id';
import { Email } from '../domain/value-objects/Email';
import { DomainError } from '../../shared/domain/DomainError';

export interface RegisterUserDto {
  id: string;
  email: string;
}

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string): Promise<RegisterUserDto> {
    const emailVo = Email.create(email);
    const existing = await this.userRepository.findByEmail(emailVo);
    if (existing.isSome()) {
      throw DomainError.createValidation('Email already registered');
    }
    const user = User.create(Id.generate(), emailVo);
    await this.userRepository.save(user);
    return this.toDto(user);
  }

  private toDto(user: User): RegisterUserDto {
    const primitives = user.toPrimitives();
    return {
      id: primitives.id,
      email: primitives.email,
    };
  }
}
