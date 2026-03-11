import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { Maybe } from '../../../shared/domain/Maybe';

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<Maybe<User>>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach((user) => {
      const primitives = user.toPrimitives();
      this.users.set(primitives.email, user);
    });
  }

  async save(user: User): Promise<void> {
    const primitives = user.toPrimitives();
    this.users.set(primitives.email, user);
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    return Maybe.fromNullable(this.users.get(email.toPrimitives()));
  }
}
