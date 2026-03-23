import { Otp } from '../value-objects/Otp';

export class OtpGenerator {
  generate(): Otp {
    const digits = 6;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return Otp.create(randomNumber.toString());
  }
}
