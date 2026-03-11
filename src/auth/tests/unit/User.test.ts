import { User } from '../../domain/entities/User';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../../domain/value-objects/Email';

describe('The User', () => {
  it('stores the provided id and email', () => {
    const id = Id.generate();
    const email = Email.create('user@example.com');

    const user = User.create(id, email);
    const primitives = user.toPrimitives();

    expect(primitives.id).toBe(id.value);
    expect(primitives.email).toBe('user@example.com');
  });

  it('is equal to another User with the same id', () => {
    const id = Id.generate();
    const email = Email.create('a@b.com');
    const user1 = User.create(id, email);
    const user2 = User.create(id, Email.create('other@b.com'));

    expect(user1.equals(user2)).toBe(true);
  });

  it('is not equal when ids differ', () => {
    const email = Email.create('a@b.com');
    const user1 = User.create(Id.generate(), email);
    const user2 = User.create(Id.generate(), email);

    expect(user1.equals(user2)).toBe(false);
  });
});
