import { MongoClient } from 'mongodb';
import { HealthRepository } from '../../health/domain/repositories/HealthRepository';
import { MongoHealthRepository } from '../../health/infrastructure/adapters/MongoHealthRepository';
import { HealthUseCase } from '../../health/application/HealthUseCase';
import { HealthController } from '../../health/infrastructure/http/HealthController';
import { Logger } from '../application/ports/Logger';
import { createPinoLogger } from './adapters/PinoLogger';

export class Factory {
  private static mongoClient: MongoClient;
  private static healthRepository: HealthRepository;
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
}

