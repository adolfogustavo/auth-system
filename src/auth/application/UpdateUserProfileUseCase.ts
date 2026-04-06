import { DomainError } from '../../shared/domain/DomainError';
import { UserRepository } from '../domain/repositories/UserRepository';
import { Email } from '../domain/value-objects/Email';
import { Phone } from '../domain/value-objects/Phone';

interface UpdateUserProfileInput {
  email: string;
  name?: string;
  lastName?: string;
  phone?: string;
}

interface UpdateUserProfileOutput {
  id: string;
  email: string;
  createdAt: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
}

export class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: UpdateUserProfileInput): Promise<UpdateUserProfileOutput> {
    const user = await this.findUserByEmailOrFail(input.email);
    const phone = input.phone !== undefined ? Phone.create(input.phone) : undefined;
    user.updateProfile({
      name: input.name,
      lastName: input.lastName,
      phone,
    });
    await this.userRepository.update(user);
    return user.toPrimitives();
  }

  private async findUserByEmailOrFail(emailValue: string) {
    const email = Email.create(emailValue);
    const maybeUser = await this.userRepository.findByEmail(email);
    return maybeUser.fold(
      () => {
        throw DomainError.createNotFound(`User ${emailValue} not found`);
      },
      (user) => user
    );
  }
}
