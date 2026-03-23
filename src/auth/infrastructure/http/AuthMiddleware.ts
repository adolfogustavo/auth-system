import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../../application/ports/TokenService';
import { Token } from '../../domain/value-objects/Token';

export interface AuthenticatedRequest extends Request {
  userEmail: string;
}

export function createAuthMiddleware(tokenService: TokenService) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.status(401).json({ error: 'Authorization token required' });
      return;
    }
    const tokenValue = authHeader.substring(7);
    const maybeEmail = tokenService.verify(Token.create(tokenValue));
    if (maybeEmail.isNone()) {
      response.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.userEmail = maybeEmail.fold(
      () => {
        throw new Error('Unexpected missing email after token validation');
      },
      (email) => email.value
    );
    next();
  };
}
