import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';
import { Phone } from '../value-objects/Phone';

interface UserPrimitives {
  id: string;
  email: string;
  createdAt: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
}

export class User {
  private constructor(
    readonly id: Id,
    readonly email: Email,
    readonly createdAt: Date,
    private name: string | null,
    private lastName: string | null,
    private phone: Phone | null
  ) {}

  static create(
    id: Id,
    email: Email,
    createdAt: Date = new Date(),
    name: string | null = null,
    lastName: string | null = null,
    phone: Phone | null = null
  ): User {
    return new User(id, email, createdAt, name, lastName, phone);
  }

  static fromPrimitives(primitives: UserPrimitives): User {
    const phone = primitives.phone ? Phone.create(primitives.phone) : null;
    return new User(
      Id.create(primitives.id),
      Email.create(primitives.email),
      new Date(primitives.createdAt),
      primitives.name,
      primitives.lastName,
      phone
    );
  }

  updateProfile(profile: { name?: string | null; lastName?: string | null; phone?: Phone | null }): void {
    if (profile.name !== undefined) {
      this.name = profile.name;
    }
    if (profile.lastName !== undefined) {
      this.lastName = profile.lastName;
    }
    if (profile.phone !== undefined) {
      this.phone = profile.phone;
    }
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      email: this.email.value,
      createdAt: this.createdAt.toISOString(),
      name: this.name,
      lastName: this.lastName,
      phone: this.phone ? this.phone.value : null,
    };
  }
}
