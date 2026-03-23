import { Response } from 'express';
import { UpdateUserProfileUseCase } from '../../application/UpdateUserProfileUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { DomainError } from '../../../shared/domain/DomainError';
import { AuthenticatedRequest } from './AuthMiddleware';
import { validateProfileUpdateBody } from './validateProfileUpdateBody';

export class ProfileController {
  constructor(
    private updateUserProfileUseCase: UpdateUserProfileUseCase,
    private logger: Logger
  ) {}

  async update(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const payload = validateProfileUpdateBody(request.body);
      const result = await this.updateUserProfileUseCase.execute({
        email: request.userEmail,
        name: payload.name,
        lastName: payload.lastName,
        phone: payload.phone,
      });
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  private handleError(error: unknown, response: Response): void {
    if (error instanceof DomainError) {
      const status = error.type === 'notFound' ? 404 : 400;
      response.status(status).json({ error: error.message });
      return;
    }
    this.logger.error(error, 'Update profile failed');
    response.status(500).json({ error: 'Internal server error' });
  }
}
