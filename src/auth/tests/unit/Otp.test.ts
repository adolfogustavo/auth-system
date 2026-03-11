import { Otp } from '../../domain/value-objects/Otp';

describe('The Otp', () => {
  it('creates an OTP from a valid 6-digit string', () => {
    const otp = Otp.create('123456');

    expect(otp.toPrimitives()).toBe('123456');
  });

  it('does not allow non-numeric string', () => {
    expect(() => Otp.create('12345a')).toThrow('OTP must be 6 numeric digits');
  });

  it('does not allow string with wrong length', () => {
    expect(() => Otp.create('12345')).toThrow('OTP must be 6 numeric digits');
    expect(() => Otp.create('1234567')).toThrow('OTP must be 6 numeric digits');
  });

  it('generates a random 6-digit OTP', () => {
    const otp = Otp.generate();

    const value = otp.toPrimitives();
    expect(value).toMatch(/^\d{6}$/);
  });

  it('is equal to another Otp with the same value', () => {
    const otp1 = Otp.create('123456');
    const otp2 = Otp.create('123456');

    expect(otp1.equals(otp2)).toBe(true);
  });

  it('is not equal to another Otp with different value', () => {
    const otp1 = Otp.create('123456');
    const otp2 = Otp.create('654321');

    expect(otp1.equals(otp2)).toBe(false);
  });
});
