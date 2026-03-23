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
    readonly name: string | null,
    readonly lastName: string | null,
    readonly phone: Phone | null
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

  updateProfile(profile: { name?: string | null; lastName?: string | null; phone?: Phone | null }): User {
    const nextName = profile.name !== undefined ? profile.name : this.name;
    const nextLastName = profile.lastName !== undefined ? profile.lastName : this.lastName;
    const nextPhone = profile.phone !== undefined ? profile.phone : this.phone;
    return new User(this.id, this.email, this.createdAt, nextName, nextLastName, nextPhone);
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
