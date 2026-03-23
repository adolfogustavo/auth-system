import { validateProfileUpdateBody } from '../../infrastructure/http/validateProfileUpdateBody';

describe('The profile update body validation', () => {
  it('accepts only name when sent alone', () => {
    const payload = validateProfileUpdateBody({ name: 'John' });

    expect(payload).toEqual({ name: 'John' });
  });

  it('accepts name, lastName and phone together', () => {
    const payload = validateProfileUpdateBody({
      name: 'John',
      lastName: 'Doe',
      phone: '1234567890',
    });

    expect(payload).toEqual({
      name: 'John',
      lastName: 'Doe',
      phone: '1234567890',
    });
  });

  it('does not allow unknown root properties', () => {
    expect(() => validateProfileUpdateBody({ name: 'John', email: 'x@y.com' })).toThrow('Unexpected fields: email');
  });

  it('lists multiple unknown properties sorted alphabetically', () => {
    expect(() => validateProfileUpdateBody({ foo: 1, name: 'a', zed: 2 })).toThrow('Unexpected fields: foo, zed');
  });

  it('requires at least one of name, lastName or phone', () => {
    expect(() => validateProfileUpdateBody({})).toThrow('At least one of name, lastName, or phone is required');
  });

  it('rejects null body', () => {
    expect(() => validateProfileUpdateBody(null)).toThrow('Invalid request body');
  });

  it('rejects array body', () => {
    expect(() => validateProfileUpdateBody([])).toThrow('Invalid request body');
  });

  it('rejects non-object body', () => {
    expect(() => validateProfileUpdateBody('not-json')).toThrow('Invalid request body');
  });

  it('requires name to be a string when present', () => {
    expect(() => validateProfileUpdateBody({ name: 123 })).toThrow('Invalid value for name');
  });

  it('requires lastName to be a string when present', () => {
    expect(() => validateProfileUpdateBody({ lastName: true })).toThrow('Invalid value for lastName');
  });

  it('requires phone to be a string when present', () => {
    expect(() => validateProfileUpdateBody({ phone: {} })).toThrow('Invalid value for phone');
  });
});
