import { MongoUserRepository } from '../../infrastructure/adapters/MongoUserRepository';
import { User } from '../../domain/entities/User';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../../domain/value-objects/Email';
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

  it('saves and finds user by email', async () => {
    const user = User.create(Id.generate(), Email.create('user@example.com'));

    await repository.save(user);
    const retrieved = await repository.findByEmail(Email.create('user@example.com'));

    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow(new Error('Not found')).equals(user)).toBe(true);
  });

  it('finds none when email does not exist', async () => {
    const retrieved = await repository.findByEmail(Email.create('unknown@example.com'));

    expect(retrieved.isNone()).toBe(true);
  });

  it('overwrites when saving same email', async () => {
    const id1 = Id.generate();
    const id2 = Id.generate();
    const user1 = User.create(id1, Email.create('same@example.com'));
    const user2 = User.create(id2, Email.create('same@example.com'));

    await repository.save(user1);
    await repository.save(user2);
    const retrieved = await repository.findByEmail(Email.create('same@example.com'));

    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow(new Error('Not found')).toPrimitives().id).toBe(id2.value);
  });
});
