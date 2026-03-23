import { Token } from '../../domain/value-objects/Token';

describe('The Token', () => {
  it('accepts a valid token string', () => {
    const token = Token.create('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature');

    expect(token.value).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature');
  });

  it('rejects an empty token', () => {
    expect(() => Token.create('')).toThrow('Token cannot be empty');
  });
});
