import { UpdateUserProfileUseCase } from '../../application/UpdateUserProfileUseCase';
import { User } from '../../domain/entities/User';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { Email } from '../../domain/value-objects/Email';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The UpdateUserProfileUseCase', () => {
  it('updates profile data for existing user', async () => {
    const existingUser = User.create(
      Id.generate(),
      Email.create('user@example.com'),
      new Date('2026-01-01T10:00:00.000Z')
    );
    const userRepository = new InMemoryUserRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(userRepository);

    const result = await useCase.execute({
      email: 'user@example.com',
      name: 'John',
      lastName: 'Doe',
      phone: '1234567890',
    });

    expect(result.email).toBe('user@example.com');
    expect(result.name).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(result.phone).toBe('1234567890');
    expect(result.createdAt).toBe('2026-01-01T10:00:00.000Z');
  });

  it('rejects when user does not exist', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new UpdateUserProfileUseCase(userRepository);

    await expect(
      useCase.execute({
        email: 'unknown@example.com',
        name: 'John',
      })
    ).rejects.toThrow('User unknown@example.com not found');
  });

  it('updates only provided fields', async () => {
    const existingUser = User.create(
      Id.generate(),
      Email.create('user@example.com'),
      new Date('2026-01-01T10:00:00.000Z'),
      'Jane',
      'Smith'
    );
    const userRepository = new InMemoryUserRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(userRepository);

    const result = await useCase.execute({
      email: 'user@example.com',
      name: 'Mary',
    });

    expect(result.name).toBe('Mary');
    expect(result.lastName).toBe('Smith');
    expect(result.phone).toBeNull();
  });

  it('validates phone format when provided', async () => {
    const existingUser = User.create(Id.generate(), Email.create('user@example.com'));
    const userRepository = new InMemoryUserRepository([existingUser]);
    const useCase = new UpdateUserProfileUseCase(userRepository);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        phone: '123abc',
      })
    ).rejects.toThrow('Invalid phone format');
  });
});
