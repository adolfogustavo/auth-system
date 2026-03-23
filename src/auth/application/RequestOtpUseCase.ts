import { DomainError } from '../../shared/domain/DomainError';
import { OtpSession } from '../domain/entities/OtpSession';
import { OtpSessionRepository } from '../domain/repositories/OtpSessionRepository';
import { UserRepository } from '../domain/repositories/UserRepository';
import { OtpGenerator } from '../domain/services/OtpGenerator';
import { Email } from '../domain/value-objects/Email';
import { OtpSender } from './ports/OtpSender';

interface RequestOtpInput {
  email: string;
}

export class RequestOtpUseCase {
  constructor(
    private userRepository: UserRepository,
    private otpSessionRepository: OtpSessionRepository,
    private otpGenerator: OtpGenerator,
    private otpSender: OtpSender
  ) {}

  async execute(input: RequestOtpInput): Promise<void> {
    const email = Email.create(input.email);
    const maybeUser = await this.userRepository.findByEmail(email);
    if (maybeUser.isNone()) {
      throw DomainError.createNotFound('User not found');
    }
    const now = new Date();
    const maybeExistingSession = await this.otpSessionRepository.findByEmail(email);
    maybeExistingSession.fold(
      () => {},
      (existingSession) => {
        if (existingSession.isLocked(now)) {
          throw DomainError.createValidation('Account is locked');
        }
      }
    );
    const otp = this.otpGenerator.generate();
    const session = OtpSession.create(email, otp, now);
    await this.otpSessionRepository.save(session);
    await this.otpSender.send(email, otp);
  }
}
