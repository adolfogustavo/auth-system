import { MongoUserRepository } from '../../infrastructure/adapters/MongoUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Phone } from '../../domain/value-objects/Phone';
import { Id } from '../../../shared/domain/value-objects/Id';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';

describe('The MongoUserRepository', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let repository: MongoUserRepository;

  beforeAll(async () => {
    mongo = await createTestMongo();
    repository = new MongoUserRepository(mongo.db());
  });

  afterAll(() => mongo.stop());
  beforeEach(() => mongo.clean());

  it('saves and finds a user by email', async () => {
    const email = Email.create('user@example.com');
    const user = User.create(Id.generate(), email);

    await repository.save(user);
    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isSome()).toBe(true);
    expect(
      retrieved.fold(
        () => false,
        (u) => u.equals(user)
      )
    ).toBe(true);
  });

  it('finds nothing when user does not exist', async () => {
    const email = Email.create('nonexistent@example.com');

    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isNone()).toBe(true);
  });

  it('checks if email exists', async () => {
    const email = Email.create('user@example.com');
    const user = User.create(Id.generate(), email);
    await repository.save(user);

    const exists = await repository.existsByEmail(email);
    const notExists = await repository.existsByEmail(Email.create('other@example.com'));

    expect(exists).toBe(true);
    expect(notExists).toBe(false);
  });

  it('updates existing user', async () => {
    const email = Email.create('user@example.com');
    const id = Id.generate();
    const user = User.create(id, email, new Date('2026-01-01T10:00:00.000Z'));
    await repository.save(user);
    const updatedUser = user.updateProfile({
      name: 'John',
      lastName: 'Doe',
      phone: Phone.create('1234567890'),
    });
    await repository.update(updatedUser);

    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isSome()).toBe(true);
    expect(
      retrieved.fold(
        () => '',
        (u) => u.id.value
      )
    ).toBe(id.value);
    expect(
      retrieved.fold(
        () => '',
        (u) => u.toPrimitives().name ?? ''
      )
    ).toBe('John');
  });

  it('finds user by id', async () => {
    const id = Id.generate();
    const user = User.create(id, Email.create('user@example.com'));
    await repository.save(user);

    const retrieved = await repository.findById(id);

    expect(retrieved.isSome()).toBe(true);
    expect(
      retrieved.fold(
        () => '',
        (u) => u.id.value
      )
    ).toBe(id.value);
  });
});
