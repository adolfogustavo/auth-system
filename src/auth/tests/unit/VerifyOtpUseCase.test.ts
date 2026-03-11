import { VerifyOtpUseCase } from '../../application/VerifyOtpUseCase';
import { InMemoryOtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { TokenGenerator } from '../../application/ports/TokenGenerator';

describe('The VerifyOtpUseCase', () => {
  const fiveMinutesMs = 5 * 60 * 1000;
  const baseTime = new Date('2026-01-01T10:00:00.000Z');

  it('throws when no OTP session exists for email', async () => {
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const tokenGenerator: TokenGenerator = { generate: () => 'jwt-token' };
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenGenerator);

    await expect(useCase.execute('user@example.com', '123456')).rejects.toThrow('OTP session not found');
  });

  it('throws when OTP session is expired', async () => {
    const email = Email.create('user@example.com');
    const session = OtpSession.create(email, Otp.create('123456'), baseTime);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenGenerator: TokenGenerator = { generate: () => 'jwt-token' };
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenGenerator);
    const afterExpiry = new Date(baseTime.getTime() + fiveMinutesMs + 1);

    await expect(useCase.execute('user@example.com', '123456', afterExpiry)).rejects.toThrow('OTP has expired');
  });

  it('records failed attempt and throws when OTP is incorrect', async () => {
    const email = Email.create('user@example.com');
    const session = OtpSession.create(email, Otp.create('123456'), baseTime);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenGenerator: TokenGenerator = { generate: () => 'jwt-token' };
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenGenerator);

    await expect(useCase.execute('user@example.com', '654321', baseTime)).rejects.toThrow('Invalid OTP');

    const updated = await otpSessionRepository.findByEmail(email);
    expect(updated.isSome()).toBe(true);
    expect(updated.getOrThrow(new Error('session')).toPrimitives().failedAttempts).toBe(1);
  });

  it('returns token and removes session when OTP is correct', async () => {
    const email = Email.create('user@example.com');
    const session = OtpSession.create(email, Otp.create('123456'), baseTime);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const tokenGenerator: TokenGenerator = {
      generate: (e) => `jwt-for-${e.toPrimitives()}`,
    };
    const useCase = new VerifyOtpUseCase(otpSessionRepository, tokenGenerator);

    const result = await useCase.execute('user@example.com', '123456', baseTime);

    expect(result.token).toBe('jwt-for-user@example.com');
    const afterDelete = await otpSessionRepository.findByEmail(email);
    expect(afterDelete.isNone()).toBe(true);
  });
});
