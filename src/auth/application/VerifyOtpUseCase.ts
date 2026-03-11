import { OtpSessionRepository } from '../domain/repositories/OtpSessionRepository';
import { Email } from '../domain/value-objects/Email';
import { Otp } from '../domain/value-objects/Otp';
import { TokenGenerator } from './ports/TokenGenerator';
import { DomainError } from '../../shared/domain/DomainError';

export interface VerifyOtpResult {
  token: string;
}

export class VerifyOtpUseCase {
  constructor(
    private otpSessionRepository: OtpSessionRepository,
    private tokenGenerator: TokenGenerator
  ) {}

  async execute(email: string, otp: string, now: Date = new Date()): Promise<VerifyOtpResult> {
    const emailVo = Email.create(email);
    const otpVo = Otp.create(otp);
    const maybeSession = await this.otpSessionRepository.findByEmail(emailVo);
    return maybeSession.fold(
      async () => {
        throw DomainError.createNotFound('OTP session not found');
      },
      async (session) => {
        try {
          const success = session.verify(otpVo, now);
          if (!success) {
            await this.otpSessionRepository.save(session);
            throw DomainError.createValidation('Invalid OTP');
          }
        } catch (error) {
          if (error instanceof DomainError) {
            throw error;
          }
          throw error;
        }
        const token = this.tokenGenerator.generate(emailVo);
        await this.otpSessionRepository.deleteByEmail(emailVo);
        return { token };
      }
    );
  }
}
