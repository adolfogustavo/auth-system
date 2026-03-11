import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';

export interface OtpNotifier {
  notify(email: Email, otp: Otp): Promise<void>;
}
