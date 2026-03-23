import { VerifyOtpUseCase } from '../../application/VerifyOtpUseCase';
import { InMemoryOtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { Token } from '../../domain/value-objects/Token';
import { TokenService } from '../../application/ports/TokenService';
import { Maybe } from '../../../shared/domain/Maybe';

const createStubTokenService = (): TokenService => ({
  generate(email: Email): Token {
    return Token.create(`token-for-${email.value}`);
  },
  verify(): Maybe<Email> {
    return Maybe.none();
  },
});

describe('The VerifyOtpUseCase', () => {
  const email = Email.create('user@example.com');
  const otp = Otp.create('123456');
  const now = new Date('2026-01-01T10:00:00.000Z');

  it('returns a token when OTP is correct', async () => {
    const session = OtpSession.create(email, otp, now);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenService = createStubTokenService();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenService);

    const result = await useCase.execute({ email: 'user@example.com', otp: '123456' }, now);

    expect(result.token).toBe('token-for-user@example.com');
  });

  it('deletes the session after successful verification', async () => {
    const session = OtpSession.create(email, otp, now);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenService = createStubTokenService();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenService);

    await useCase.execute({ email: 'user@example.com', otp: '123456' }, now);

    const remainingSession = await otpSessionRepository.findByEmail(email);
    expect(remainingSession.isNone()).toBe(true);
  });

  it('rejects when no OTP session exists', async () => {
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const tokenService = createStubTokenService();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenService);

    await expect(useCase.execute({ email: 'user@example.com', otp: '123456' }, now)).rejects.toThrow(
      'No OTP session found'
    );
  });

  it('rejects when OTP is expired', async () => {
    const session = OtpSession.create(email, otp, now);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenService = createStubTokenService();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenService);
    const sixMinutesLater = new Date('2026-01-01T10:06:00.000Z');

    await expect(useCase.execute({ email: 'user@example.com', otp: '123456' }, sixMinutesLater)).rejects.toThrow(
      'OTP has expired'
    );
  });

  it('rejects when OTP is incorrect and increments attempts', async () => {
    const session = OtpSession.create(email, otp, now);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenService = createStubTokenService();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenService);

    await expect(useCase.execute({ email: 'user@example.com', otp: '654321' }, now)).rejects.toThrow('Invalid OTP');

    const updatedSession = await otpSessionRepository.findByEmail(email);
    expect(updatedSession.isSome()).toBe(true);
  });

  it('locks account after 3 failed attempts', async () => {
    const session = OtpSession.create(email, otp, now);
    session.incrementAttempts();
    session.incrementAttempts();
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenService = createStubTokenService();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenService);

    await expect(useCase.execute({ email: 'user@example.com', otp: '654321' }, now)).rejects.toThrow('Account locked');

    const updatedSession = await otpSessionRepository.findByEmail(email);
    expect(updatedSession.isSome()).toBe(true);
    expect(
      updatedSession.fold(
        () => false,
        (s) => s.isLocked(now)
      )
    ).toBe(true);
  });
});
