import { Maybe } from '../../../shared/domain/Maybe';
import { Email } from '../../domain/value-objects/Email';
import { Token } from '../../domain/value-objects/Token';

export interface TokenService {
  generate(email: Email): Token;
  verify(token: Token): Maybe<Email>;
}
