import { DomainError } from '../../shared/domain/DomainError';
import { OtpSessionRepository } from '../domain/repositories/OtpSessionRepository';
import { Email } from '../domain/value-objects/Email';
import { Otp } from '../domain/value-objects/Otp';
import { TokenService } from './ports/TokenService';

interface VerifyOtpInput {
  email: string;
  otp: string;
}

interface VerifyOtpOutput {
  token: string;
}

export class VerifyOtpUseCase {
  constructor(
    private otpSessionRepository: OtpSessionRepository,
    private tokenService: TokenService
  ) {}

  async execute(input: VerifyOtpInput, currentTime: Date = new Date()): Promise<VerifyOtpOutput> {
    const email = Email.create(input.email);
    const otpToVerify = Otp.create(input.otp);
    const maybeSession = await this.otpSessionRepository.findByEmail(email);
    if (maybeSession.isNone()) {
      throw DomainError.createValidation('No OTP session found');
    }
    const session = maybeSession.fold(
      () => {
        throw DomainError.createValidation('No OTP session found');
      },
      (s) => s
    );
    if (session.isExpired(currentTime)) {
      throw DomainError.createValidation('OTP has expired');
    }
    if (!session.validateOtp(otpToVerify)) {
      session.incrementAttempts();
      if (session.hasExceededMaxAttempts()) {
        session.lock(currentTime);
        await this.otpSessionRepository.save(session);
        throw DomainError.createValidation('Account locked');
      }
      await this.otpSessionRepository.save(session);
      throw DomainError.createValidation('Invalid OTP');
    }
    await this.otpSessionRepository.deleteByEmail(email);
    const token = this.tokenService.generate(email);
    return { token: token.value };
  }
}
