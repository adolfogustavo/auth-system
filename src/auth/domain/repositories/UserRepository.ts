import { Maybe } from '../../../shared/domain/Maybe';
import { Id } from '../../../shared/domain/value-objects/Id';
import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface UserRepository {
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  findById(id: Id): Promise<Maybe<User>>;
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

  async update(user: User): Promise<void> {
    this.users.set(user.email.value, user);
  }

  async findById(id: Id): Promise<Maybe<User>> {
    const user = Array.from(this.users.values()).find((existingUser) => existingUser.id.equals(id));
    return Maybe.fromNullable(user);
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    return Maybe.fromNullable(this.users.get(email.value));
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return this.users.has(email.value);
  }
}
