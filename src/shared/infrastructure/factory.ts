import { MongoClient } from 'mongodb';
import { HealthRepository } from '../../health/domain/repositories/HealthRepository';
import { MongoHealthRepository } from '../../health/infrastructure/adapters/MongoHealthRepository';
import { HealthUseCase } from '../../health/application/HealthUseCase';
import { HealthController } from '../../health/infrastructure/http/HealthController';
import { UserRepository } from '../../auth/domain/repositories/UserRepository';
import { OtpSessionRepository } from '../../auth/domain/repositories/OtpSessionRepository';
import { MongoUserRepository } from '../../auth/infrastructure/adapters/MongoUserRepository';
import { MongoOtpSessionRepository } from '../../auth/infrastructure/adapters/MongoOtpSessionRepository';
import { ConsoleOtpSender } from '../../auth/infrastructure/adapters/ConsoleOtpSender';
import { JwtTokenService } from '../../auth/infrastructure/adapters/JwtTokenService';
import { OtpGenerator } from '../../auth/domain/services/OtpGenerator';
import { RegisterUserUseCase } from '../../auth/application/RegisterUserUseCase';
import { RequestOtpUseCase } from '../../auth/application/RequestOtpUseCase';
import { UpdateUserProfileUseCase } from '../../auth/application/UpdateUserProfileUseCase';
import { VerifyOtpUseCase } from '../../auth/application/VerifyOtpUseCase';
import { AuthController } from '../../auth/infrastructure/http/AuthController';
import { createAuthMiddleware } from '../../auth/infrastructure/http/AuthMiddleware';
import { ProfileController } from '../../auth/infrastructure/http/ProfileController';
import { OtpSender } from '../../auth/application/ports/OtpSender';
import { TokenService } from '../../auth/application/ports/TokenService';
import { Logger } from '../application/ports/Logger';
import { createPinoLogger } from './adapters/PinoLogger';

export class Factory {
  private static mongoClient: MongoClient;
  private static healthRepository: HealthRepository;
  private static userRepository: UserRepository;
  private static otpSessionRepository: OtpSessionRepository;
  private static otpSender: OtpSender;
  private static tokenService: TokenService;
  private static logger: Logger;

  static getLogger(): Logger {
    if (!this.logger) {
      this.logger = createPinoLogger();
    }
    return this.logger;
  }

  static async connectToMongo(): Promise<void> {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is required');
    }
    this.mongoClient = await MongoClient.connect(mongoUri);
  }

  static async disconnectFromMongo(): Promise<void> {
    await this.mongoClient.close();
  }

  static setMongoClient(client: MongoClient): void {
    this.mongoClient = client;
  }

  private static getHealthRepository(): HealthRepository {
    if (!this.healthRepository) {
      this.healthRepository = new MongoHealthRepository(this.mongoClient.db());
    }
    return this.healthRepository;
  }

  static createHealthUseCase(): HealthUseCase {
    return new HealthUseCase(this.getHealthRepository());
  }

  static createHealthController(): HealthController {
    return new HealthController(this.createHealthUseCase(), this.getLogger());
  }

  private static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new MongoUserRepository(this.mongoClient.db());
    }
    return this.userRepository;
  }

  private static getOtpSessionRepository(): OtpSessionRepository {
    if (!this.otpSessionRepository) {
      this.otpSessionRepository = new MongoOtpSessionRepository(this.mongoClient.db());
    }
    return this.otpSessionRepository;
  }

  private static getOtpSender(): OtpSender {
    if (!this.otpSender) {
      this.otpSender = new ConsoleOtpSender(this.getLogger());
    }
    return this.otpSender;
  }

  private static getTokenService(): TokenService {
    if (!this.tokenService) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required');
      }
      this.tokenService = new JwtTokenService(jwtSecret);
    }
    return this.tokenService;
  }

  static createRegisterUserUseCase(): RegisterUserUseCase {
    return new RegisterUserUseCase(this.getUserRepository());
  }

  static createRequestOtpUseCase(): RequestOtpUseCase {
    return new RequestOtpUseCase(
      this.getUserRepository(),
      this.getOtpSessionRepository(),
      new OtpGenerator(),
      this.getOtpSender()
    );
  }

  static createVerifyOtpUseCase(): VerifyOtpUseCase {
    return new VerifyOtpUseCase(this.getOtpSessionRepository(), this.getTokenService());
  }

  static createUpdateUserProfileUseCase(): UpdateUserProfileUseCase {
    return new UpdateUserProfileUseCase(this.getUserRepository());
  }

  static createAuthController(): AuthController {
    return new AuthController(
      this.createRegisterUserUseCase(),
      this.createRequestOtpUseCase(),
      this.createVerifyOtpUseCase(),
      this.getLogger()
    );
  }

  static createProfileController(): ProfileController {
    return new ProfileController(this.createUpdateUserProfileUseCase(), this.getLogger());
  }

  static createAuthMiddleware() {
    return createAuthMiddleware(this.getTokenService());
  }
}
