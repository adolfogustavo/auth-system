import jwt from 'jsonwebtoken';
import { Maybe } from '../../../shared/domain/Maybe';
import { TokenService } from '../../application/ports/TokenService';
import { Email } from '../../domain/value-objects/Email';
import { Token } from '../../domain/value-objects/Token';

export class JwtTokenService implements TokenService {
  constructor(private secret: string) {}

  generate(email: Email): Token {
    const tokenExpirationHours = 24;
    const token = jwt.sign({ email: email.value }, this.secret, {
      algorithm: 'HS256',
      expiresIn: `${tokenExpirationHours}h`,
    });
    return Token.create(token);
  }

  verify(token: Token): Maybe<Email> {
    try {
      const decoded = jwt.verify(token.value, this.secret, { algorithms: ['HS256'] }) as {
        email: string;
      };
      return Maybe.some(Email.create(decoded.email));
    } catch {
      return Maybe.none();
    }
  }
}
