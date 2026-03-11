import { MongoClient } from 'mongodb';
import { HealthRepository } from '../../health/domain/repositories/HealthRepository';
import { MongoHealthRepository } from '../../health/infrastructure/adapters/MongoHealthRepository';
import { HealthUseCase } from '../../health/application/HealthUseCase';
import { HealthController } from '../../health/infrastructure/http/HealthController';
import { Logger } from '../application/ports/Logger';
import { createPinoLogger } from './adapters/PinoLogger';
import { UserRepository } from '../../auth/domain/repositories/UserRepository';
import { MongoUserRepository } from '../../auth/infrastructure/adapters/MongoUserRepository';
import { OtpSessionRepository } from '../../auth/domain/repositories/OtpSessionRepository';
import { InMemoryOtpSessionRepository } from '../../auth/domain/repositories/OtpSessionRepository';
import { OtpNotifier } from '../../auth/application/ports/OtpNotifier';
import { ConsoleOtpNotifier } from '../../auth/infrastructure/adapters/ConsoleOtpNotifier';
import { TokenGenerator } from '../../auth/application/ports/TokenGenerator';
import { JwtTokenGenerator } from '../../auth/infrastructure/adapters/JwtTokenGenerator';
import { RegisterUserUseCase } from '../../auth/application/RegisterUserUseCase';
import { RequestLoginOtpUseCase } from '../../auth/application/RequestLoginOtpUseCase';
import { VerifyOtpUseCase } from '../../auth/application/VerifyOtpUseCase';
import { AuthController } from '../../auth/infrastructure/http/AuthController';

export class Factory {
  private static mongoClient: MongoClient;
  private static healthRepository: HealthRepository;
  private static logger: Logger;
  private static otpNotifier: OtpNotifier | null = null;
  private static otpSessionRepository: OtpSessionRepository | null = null;

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

  static setOtpNotifier(notifier: OtpNotifier | null): void {
    this.otpNotifier = notifier;
  }

  static resetOtpSessionRepository(): void {
    this.otpSessionRepository = null;
  }

  private static getAuthUserRepository(): UserRepository {
    return new MongoUserRepository(this.mongoClient.db());
  }

  private static getOtpSessionRepository(): OtpSessionRepository {
    if (!this.otpSessionRepository) {
      this.otpSessionRepository = new InMemoryOtpSessionRepository();
    }
    return this.otpSessionRepository;
  }

  private static getOtpNotifier(): OtpNotifier {
    return this.otpNotifier ?? new ConsoleOtpNotifier();
  }

  private static getTokenGenerator(): TokenGenerator {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return new JwtTokenGenerator(secret);
  }

  static createAuthController(): AuthController {
    return new AuthController(
      new RegisterUserUseCase(this.getAuthUserRepository()),
      new RequestLoginOtpUseCase(this.getAuthUserRepository(), this.getOtpSessionRepository(), this.getOtpNotifier()),
      new VerifyOtpUseCase(this.getOtpSessionRepository(), this.getTokenGenerator()),
      this.getLogger()
    );
  }
}
