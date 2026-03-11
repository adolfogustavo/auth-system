import jwt from 'jsonwebtoken';
import { TokenGenerator } from '../../application/ports/TokenGenerator';
import { Email } from '../../domain/value-objects/Email';

const expiresInSeconds = 24 * 60 * 60;

export class JwtTokenGenerator implements TokenGenerator {
  constructor(private readonly secret: string) {}

  generate(email: Email): string {
    return jwt.sign({ email: email.toPrimitives() }, this.secret, { algorithm: 'HS256', expiresIn: expiresInSeconds });
  }
}
