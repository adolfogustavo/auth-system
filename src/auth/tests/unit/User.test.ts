import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Phone } from '../../domain/value-objects/Phone';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The User', () => {
  const email = Email.create('user@example.com');
  const createdAt = new Date('2026-01-01T10:00:00.000Z');

  it('stores the provided id and email', () => {
    const id = Id.generate();

    const user = User.create(id, email, createdAt);
    const primitives = user.toPrimitives();

    expect(primitives.id).toBe(id.value);
    expect(primitives.email).toBe('user@example.com');
    expect(primitives.createdAt).toBe(createdAt.toISOString());
    expect(primitives.name).toBeNull();
    expect(primitives.lastName).toBeNull();
    expect(primitives.phone).toBeNull();
  });

  it('is equal to another User with same id', () => {
    const id = Id.generate();
    const user1 = User.create(id, email, createdAt);
    const user2 = User.create(id, Email.create('other@example.com'), createdAt);

    expect(user1.equals(user2)).toBe(true);
  });

  it('is not equal when ids differ', () => {
    const user1 = User.create(Id.generate(), email, createdAt);
    const user2 = User.create(Id.generate(), email, createdAt);

    expect(user1.equals(user2)).toBe(false);
  });

  it('creates user with complete profile', () => {
    const user = User.create(Id.generate(), email, createdAt, 'John', 'Doe', Phone.create('1234567890'));

    const primitives = user.toPrimitives();

    expect(primitives.name).toBe('John');
    expect(primitives.lastName).toBe('Doe');
    expect(primitives.phone).toBe('1234567890');
  });

  it('updates only name in profile', () => {
    const user = User.create(Id.generate(), email, createdAt);

    const updatedUser = user.updateProfile({ name: 'Jane' });
    const primitives = updatedUser.toPrimitives();

    expect(primitives.name).toBe('Jane');
    expect(primitives.lastName).toBeNull();
    expect(primitives.phone).toBeNull();
  });

  it('updates only phone in profile', () => {
    const user = User.create(Id.generate(), email, createdAt);

    const updatedUser = user.updateProfile({ phone: Phone.create('1234567890') });
    const primitives = updatedUser.toPrimitives();

    expect(primitives.phone).toBe('1234567890');
  });

  it('updates multiple fields in profile', () => {
    const user = User.create(Id.generate(), email, createdAt);

    const updatedUser = user.updateProfile({
      name: 'John',
      lastName: 'Doe',
      phone: Phone.create('1234567890'),
    });
    const primitives = updatedUser.toPrimitives();

    expect(primitives.name).toBe('John');
    expect(primitives.lastName).toBe('Doe');
    expect(primitives.phone).toBe('1234567890');
  });

  it('keeps non-updated fields', () => {
    const user = User.create(Id.generate(), email, createdAt, 'John', 'Doe', Phone.create('1234567890'));

    const updatedUser = user.updateProfile({ name: 'Jane' });
    const primitives = updatedUser.toPrimitives();

    expect(primitives.name).toBe('Jane');
    expect(primitives.lastName).toBe('Doe');
    expect(primitives.phone).toBe('1234567890');
  });

  it('keeps createdAt after update', () => {
    const user = User.create(Id.generate(), email, createdAt);

    const updatedUser = user.updateProfile({ name: 'Jane' });
    const primitives = updatedUser.toPrimitives();

    expect(primitives.createdAt).toBe(createdAt.toISOString());
  });
});
