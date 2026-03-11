import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/RegisterUserUseCase';
import { RequestLoginOtpUseCase } from '../../application/RequestLoginOtpUseCase';
import { VerifyOtpUseCase } from '../../application/VerifyOtpUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { DomainError } from '../../../shared/domain/DomainError';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private requestLoginOtpUseCase: RequestLoginOtpUseCase,
    private verifyOtpUseCase: VerifyOtpUseCase,
    private logger: Logger
  ) {}

  async register(request: Request, response: Response): Promise<void> {
    const { email } = request.body;
    if (!email || typeof email !== 'string') {
      response.status(400).json({ error: 'email is required' });
      return;
    }
    try {
      const result = await this.registerUserUseCase.execute(email);
      response.status(201).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async requestOtp(request: Request, response: Response): Promise<void> {
    const { email } = request.body;
    if (!email || typeof email !== 'string') {
      response.status(400).json({ error: 'email is required' });
      return;
    }
    try {
      await this.requestLoginOtpUseCase.execute(email);
      response.status(200).json({ message: 'OTP sent' });
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async verifyOtp(request: Request, response: Response): Promise<void> {
    const { email, otp } = request.body;
    if (!email || typeof email !== 'string') {
      response.status(400).json({ error: 'email is required' });
      return;
    }
    if (!otp || typeof otp !== 'string') {
      response.status(400).json({ error: 'otp is required' });
      return;
    }
    try {
      const result = await this.verifyOtpUseCase.execute(email, otp);
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  private handleError(error: unknown, response: Response): void {
    if (error instanceof DomainError) {
      const statusMap = {
        notFound: 404,
        validation: 422,
        other: 400,
      };
      const status = statusMap[error.type];
      response.status(status).json({ error: error.message });
      return;
    }
    this.logger.error(error, 'Auth request failed');
    response.status(500).json({ error: 'Internal server error' });
  }
}
