import jwt from 'jsonwebtoken';
import { JwtTokenGenerator } from '../../infrastructure/adapters/JwtTokenGenerator';
import { Email } from '../../domain/value-objects/Email';

describe('The JwtTokenGenerator', () => {
  const secret = 'test-secret';

  it('generates a token that contains the email claim', () => {
    const generator = new JwtTokenGenerator(secret);
    const email = Email.create('user@example.com');

    const token = generator.generate(email);
    const decoded = jwt.verify(token, secret) as { email: string; exp: number };

    expect(decoded.email).toBe('user@example.com');
  });

  it('generates a token that expires in 24 hours', () => {
    const generator = new JwtTokenGenerator(secret);
    const email = Email.create('user@example.com');
    const nowSeconds = Math.floor(Date.now() / 1000);
    const twentyFourHoursInSeconds = 24 * 60 * 60;

    const token = generator.generate(email);
    const decoded = jwt.verify(token, secret) as { exp: number };

    expect(decoded.exp).toBeGreaterThanOrEqual(nowSeconds + twentyFourHoursInSeconds - 60);
    expect(decoded.exp).toBeLessThanOrEqual(nowSeconds + twentyFourHoursInSeconds + 60);
  });
});
