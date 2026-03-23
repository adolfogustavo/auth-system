import { Maybe } from '../../../shared/domain/Maybe';
import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<Maybe<User>>;
  existsByEmail(email: Email): Promise<boolean>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User>;

  constructor(initialUsers: User[] = []) {
    this.users = new Map(initialUsers.map((user) => [user.email.value, user]));
  }

  async save(user: User): Promise<void> {
    this.users.set(user.email.value, user);
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    return Maybe.fromNullable(this.users.get(email.value));
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return this.users.has(email.value);
  }
}
