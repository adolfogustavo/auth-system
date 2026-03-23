import { RequestOtpUseCase } from '../../application/RequestOtpUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { InMemoryOtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { OtpGenerator } from '../../domain/services/OtpGenerator';
import { User } from '../../domain/entities/User';
import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { Id } from '../../../shared/domain/value-objects/Id';
import { OtpSender } from '../../application/ports/OtpSender';

const createStubOtpSender = (): OtpSender & { calls: Array<{ email: string; otp: string }> } => {
  const calls: Array<{ email: string; otp: string }> = [];
  return {
    calls,
    async send(email: Email, otp: Otp): Promise<void> {
      calls.push({ email: email.value, otp: otp.value });
    },
  };
};

describe('The RequestOtpUseCase', () => {
  const email = Email.create('user@example.com');
  const user = User.create(Id.generate(), email);

  it('sends an OTP for an existing user', async () => {
    const userRepository = new InMemoryUserRepository([user]);
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const otpGenerator = new OtpGenerator();
    const otpSender = createStubOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpGenerator, otpSender);

    await useCase.execute({ email: 'user@example.com' });

    expect(otpSender.calls).toHaveLength(1);
    expect(otpSender.calls[0].email).toBe('user@example.com');
  });

  it('creates an OTP session', async () => {
    const userRepository = new InMemoryUserRepository([user]);
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const otpGenerator = new OtpGenerator();
    const otpSender = createStubOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpGenerator, otpSender);

    await useCase.execute({ email: 'user@example.com' });

    const session = await otpSessionRepository.findByEmail(email);
    expect(session.isSome()).toBe(true);
  });

  it('rejects when user does not exist', async () => {
    const userRepository = new InMemoryUserRepository();
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const otpGenerator = new OtpGenerator();
    const otpSender = createStubOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpGenerator, otpSender);

    await expect(useCase.execute({ email: 'unknown@example.com' })).rejects.toThrow('User not found');
  });

  it('rejects when account is locked', async () => {
    const userRepository = new InMemoryUserRepository([user]);
    const now = new Date();
    const lockedSession = OtpSession.create(email, Otp.create('123456'), now);
    lockedSession.lock(now);
    const otpSessionRepository = new InMemoryOtpSessionRepository([lockedSession]);
    const otpGenerator = new OtpGenerator();
    const otpSender = createStubOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpGenerator, otpSender);

    await expect(useCase.execute({ email: 'user@example.com' })).rejects.toThrow('Account is locked');
  });
});
