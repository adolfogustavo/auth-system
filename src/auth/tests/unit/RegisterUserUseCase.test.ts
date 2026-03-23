import { RegisterUserUseCase } from '../../application/RegisterUserUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The RegisterUserUseCase', () => {
  it('registers a new user with the given email', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(userRepository);

    const result = await useCase.execute({ email: 'user@example.com' });

    expect(result.email).toBe('user@example.com');
    expect(result.id).toBeDefined();
  });

  it('persists the registered user', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(userRepository);

    await useCase.execute({ email: 'user@example.com' });

    const email = Email.create('user@example.com');
    const savedUser = await userRepository.findByEmail(email);
    expect(savedUser.isSome()).toBe(true);
  });

  it('rejects registration when email already exists', async () => {
    const existingUser = User.create(Id.generate(), Email.create('user@example.com'));
    const userRepository = new InMemoryUserRepository([existingUser]);
    const useCase = new RegisterUserUseCase(userRepository);

    await expect(useCase.execute({ email: 'user@example.com' })).rejects.toThrow('Email already registered');
  });
});
