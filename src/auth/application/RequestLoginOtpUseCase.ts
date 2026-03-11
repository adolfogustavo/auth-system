import { UserRepository } from '../domain/repositories/UserRepository';
import { OtpSessionRepository } from '../domain/repositories/OtpSessionRepository';
import { Email } from '../domain/value-objects/Email';
import { Otp } from '../domain/value-objects/Otp';
import { OtpSession } from '../domain/entities/OtpSession';
import { OtpNotifier } from './ports/OtpNotifier';
import { DomainError } from '../../shared/domain/DomainError';

export class RequestLoginOtpUseCase {
  constructor(
    private userRepository: UserRepository,
    private otpSessionRepository: OtpSessionRepository,
    private otpNotifier: OtpNotifier
  ) {}

  async execute(email: string): Promise<void> {
    const emailVo = Email.create(email);
    const maybeUser = await this.userRepository.findByEmail(emailVo);
    if (maybeUser.isNone()) {
      throw DomainError.createNotFound('User not found');
    }
    const now = new Date();
    const maybeSession = await this.otpSessionRepository.findByEmail(emailVo);
    const isBlocked = maybeSession.fold(
      () => false,
      (session) => session.isBlocked(now)
    );
    if (isBlocked) {
      throw DomainError.createValidation('OTP session is blocked');
    }
    const otp = Otp.generate();
    const session = OtpSession.create(emailVo, otp, now);
    await this.otpSessionRepository.save(session);
    await this.otpNotifier.notify(emailVo, otp);
  }
}
