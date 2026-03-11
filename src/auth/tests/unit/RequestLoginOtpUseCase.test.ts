import { RequestLoginOtpUseCase } from '../../application/RequestLoginOtpUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { InMemoryOtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { User } from '../../domain/entities/User';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../../domain/value-objects/Email';
import { OtpSession } from '../../domain/entities/OtpSession';
import { Otp } from '../../domain/value-objects/Otp';
import { OtpNotifier } from '../../application/ports/OtpNotifier';

describe('The RequestLoginOtpUseCase', () => {
  it('throws when user does not exist', async () => {
    const userRepository = new InMemoryUserRepository();
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const otpNotifier: OtpNotifier = { notify: async () => {} };
    const useCase = new RequestLoginOtpUseCase(userRepository, otpSessionRepository, otpNotifier);

    await expect(useCase.execute('unknown@example.com')).rejects.toThrow('User not found');
  });

  it('throws when user has a blocked OTP session', async () => {
    const user = User.create(Id.generate(), Email.create('user@example.com'));
    const userRepository = new InMemoryUserRepository([user]);
    const blockedSession = OtpSession.create(Email.create('user@example.com'), Otp.create('123456'), new Date());
    blockedSession.verify(Otp.create('000000'), new Date());
    blockedSession.verify(Otp.create('111111'), new Date());
    blockedSession.verify(Otp.create('222222'), new Date());
    const otpSessionRepository = new InMemoryOtpSessionRepository([blockedSession]);
    const otpNotifier: OtpNotifier = { notify: async () => {} };
    const useCase = new RequestLoginOtpUseCase(userRepository, otpSessionRepository, otpNotifier);

    await expect(useCase.execute('user@example.com')).rejects.toThrow('OTP session is blocked');
  });

  it('creates OTP session and notifies when user exists', async () => {
    const user = User.create(Id.generate(), Email.create('user@example.com'));
    const userRepository = new InMemoryUserRepository([user]);
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    let notifiedEmail: string | null = null;
    let notifiedOtp: string | null = null;
    const otpNotifier: OtpNotifier = {
      notify: async (email, otp) => {
        notifiedEmail = email.toPrimitives();
        notifiedOtp = otp.toPrimitives();
      },
    };
    const useCase = new RequestLoginOtpUseCase(userRepository, otpSessionRepository, otpNotifier);

    await useCase.execute('user@example.com');

    expect(notifiedEmail).toBe('user@example.com');
    expect(notifiedOtp).toMatch(/^\d{6}$/);
    const session = await otpSessionRepository.findByEmail(Email.create('user@example.com'));
    expect(session.isSome()).toBe(true);
  });
});
