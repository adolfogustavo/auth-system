import { Email } from '../../domain/value-objects/Email';

describe('The Email', () => {
  it('creates an email from a valid value containing @', () => {
    const email = Email.create('user@example.com');

    expect(email.toPrimitives()).toBe('user@example.com');
  });

  it('does not allow empty email', () => {
    expect(() => Email.create('')).toThrow('Invalid email format');
  });

  it('does not allow email without @', () => {
    expect(() => Email.create('userexample.com')).toThrow('Invalid email format');
  });

  it('is equal to another Email with the same value', () => {
    const email1 = Email.create('a@b.com');
    const email2 = Email.create('a@b.com');

    expect(email1.equals(email2)).toBe(true);
  });

  it('is not equal to another Email with different value', () => {
    const email1 = Email.create('a@b.com');
    const email2 = Email.create('b@a.com');

    expect(email1.equals(email2)).toBe(false);
  });
});
