import { RegisterUserUseCase } from '../../application/RegisterUserUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../../domain/value-objects/Email';

describe('The RegisterUserUseCase', () => {
  it('registers a new user and returns id and email', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(userRepository);

    const result = await useCase.execute('user@example.com');

    expect(result.id).toBeDefined();
    expect(result.email).toBe('user@example.com');
  });

  it('persists the user', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(userRepository);

    await useCase.execute('user@example.com');

    const found = await userRepository.findByEmail(Email.create('user@example.com'));
    expect(found.isSome()).toBe(true);
    expect(found.getOrThrow(new Error('expected user')).toPrimitives().email).toBe('user@example.com');
  });

  it('throws when email already exists', async () => {
    const existingUser = User.create(Id.generate(), Email.create('existing@example.com'));
    const userRepository = new InMemoryUserRepository([existingUser]);
    const useCase = new RegisterUserUseCase(userRepository);

    await expect(useCase.execute('existing@example.com')).rejects.toThrow('Email already registered');
  });
});
