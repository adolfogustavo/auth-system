import { OtpGenerator } from '../../domain/services/OtpGenerator';

describe('The OtpGenerator', () => {
  it('generates a 6-digit OTP', () => {
    const generator = new OtpGenerator();

    const otp = generator.generate();

    expect(otp.value).toMatch(/^\d{6}$/);
  });

  it('generates different OTPs on subsequent calls', () => {
    const generator = new OtpGenerator();
    const generatedOtps = new Set<string>();

    for (let i = 0; i < 10; i++) {
      generatedOtps.add(generator.generate().value);
    }

    expect(generatedOtps.size).toBeGreaterThan(1);
  });
});
