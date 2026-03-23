import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';

interface UserPrimitives {
  id: string;
  email: string;
}

export class User {
  private constructor(
    readonly id: Id,
    readonly email: Email
  ) {}

  static create(id: Id, email: Email): User {
    return new User(id, email);
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      email: this.email.value,
    };
  }
}
