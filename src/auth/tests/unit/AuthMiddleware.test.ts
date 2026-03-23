import { NextFunction, Request, Response } from 'express';
import { createAuthMiddleware, AuthenticatedRequest } from '../../infrastructure/http/AuthMiddleware';
import { TokenService } from '../../application/ports/TokenService';
import { Email } from '../../domain/value-objects/Email';
import { Token } from '../../domain/value-objects/Token';
import { Maybe } from '../../../shared/domain/Maybe';

function createStubTokenService(verifiedEmail?: string): TokenService {
  return {
    generate(email: Email): Token {
      return Token.create(`token-for-${email.value}`);
    },
    verify(): Maybe<Email> {
      if (!verifiedEmail) {
        return Maybe.none();
      }
      return Maybe.some(Email.create(verifiedEmail));
    },
  };
}

describe('The AuthMiddleware', () => {
  it('does not allow access without authorization token', () => {
    const middleware = createAuthMiddleware(createStubTokenService());
    const request = { headers: {} } as Request;
    const json = jest.fn();
    const response = { status: jest.fn(() => ({ json })) } as unknown as Response;
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Authorization token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('does not allow access with invalid token', () => {
    const middleware = createAuthMiddleware(createStubTokenService());
    const request = { headers: { authorization: 'Bearer invalid-token' } } as Request;
    const json = jest.fn();
    const response = { status: jest.fn(() => ({ json })) } as unknown as Response;
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows access and attaches user email when token is valid', () => {
    const middleware = createAuthMiddleware(createStubTokenService('user@example.com'));
    const request = { headers: { authorization: 'Bearer valid-token' } } as AuthenticatedRequest;
    const json = jest.fn();
    const response = { status: jest.fn(() => ({ json })) } as unknown as Response;
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(request.userEmail).toBe('user@example.com');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
