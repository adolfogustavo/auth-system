import { Email } from '../../domain/value-objects/Email';

describe('The Email', () => {
  it('accepts a valid email', () => {
    const email = Email.create('user@example.com');

    expect(email.value).toBe('user@example.com');
  });

  it('considers two emails with same value as equal', () => {
    const email1 = Email.create('user@example.com');
    const email2 = Email.create('user@example.com');

    expect(email1.equals(email2)).toBe(true);
  });

  it('considers two emails with different values as not equal', () => {
    const email1 = Email.create('user@example.com');
    const email2 = Email.create('other@example.com');

    expect(email1.equals(email2)).toBe(false);
  });

  it('rejects an empty email', () => {
    expect(() => Email.create('')).toThrow('Invalid email format');
  });

  it('rejects an email without @', () => {
    expect(() => Email.create('userexample.com')).toThrow('Invalid email format');
  });

  it('rejects an email without domain', () => {
    expect(() => Email.create('user@')).toThrow('Invalid email format');
  });

  it('rejects an email without user', () => {
    expect(() => Email.create('@example.com')).toThrow('Invalid email format');
  });
});
