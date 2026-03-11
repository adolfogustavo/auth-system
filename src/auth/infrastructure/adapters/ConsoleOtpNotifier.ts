import { OtpNotifier } from '../../application/ports/OtpNotifier';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';

export class ConsoleOtpNotifier implements OtpNotifier {
  async notify(email: Email, otp: Otp): Promise<void> {
    // eslint-disable-next-line no-console -- OTP is delivered by console per requirements
    console.log(`OTP for ${email.toPrimitives()}: ${otp.toPrimitives()}`);
  }
}
