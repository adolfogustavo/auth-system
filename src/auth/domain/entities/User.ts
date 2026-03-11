import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';

export class User {
  private constructor(
    private readonly id: Id,
    private readonly email: Email
  ) {}

  static create(id: Id, email: Email): User {
    return new User(id, email);
  }

  toPrimitives(): { id: string; email: string } {
    return {
      id: this.id.value,
      email: this.email.toPrimitives(),
    };
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}
