import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/RegisterUserUseCase';
import { RequestOtpUseCase } from '../../application/RequestOtpUseCase';
import { VerifyOtpUseCase } from '../../application/VerifyOtpUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { DomainError } from '../../../shared/domain/DomainError';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private requestOtpUseCase: RequestOtpUseCase,
    private verifyOtpUseCase: VerifyOtpUseCase,
    private logger: Logger
  ) {}

  async register(request: Request, response: Response): Promise<void> {
    try {
      const { email } = request.body;
      const result = await this.registerUserUseCase.execute({ email });
      response.status(201).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async login(request: Request, response: Response): Promise<void> {
    try {
      const { email } = request.body;
      await this.requestOtpUseCase.execute({ email });
      response.status(200).json({ message: 'OTP sent' });
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async verify(request: Request, response: Response): Promise<void> {
    try {
      const { email, otp } = request.body;
      const result = await this.verifyOtpUseCase.execute({ email, otp });
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  private handleError(error: unknown, response: Response): void {
    if (error instanceof DomainError) {
      const status = this.getStatusCode(error);
      response.status(status).json({ error: error.message });
      return;
    }
    this.logger.error(error, 'Auth operation failed');
    response.status(500).json({ error: 'Internal server error' });
  }

  private getStatusCode(error: DomainError): number {
    if (error.type === 'notFound') {
      return 404;
    }
    if (error.message === 'Email already registered') {
      return 409;
    }
    if (error.message === 'Account is locked' || error.message === 'Account locked') {
      return 429;
    }
    return 400;
  }
}
