import express, { Express } from 'express';
import pinoHttp from 'pino-http';
import { AuthenticatedRequest } from '../../auth/infrastructure/http/AuthMiddleware';
import { Factory } from './factory';
import { pinoInstance } from './adapters/PinoLogger';
import { Routes } from './routes';

export function createServer(): Express {
  const app = express();
  app.use(express.json());
  app.use(pinoHttp({ logger: pinoInstance }));
  const healthController = Factory.createHealthController();
  app.get(Routes.Health, (request, response) => healthController.check(request, response));
  const authController = Factory.createAuthController();
  app.post(Routes.AuthRegister, (request, response) => authController.register(request, response));
  app.post(Routes.AuthLogin, (request, response) => authController.login(request, response));
  app.post(Routes.AuthVerify, (request, response) => authController.verify(request, response));
  const profileController = Factory.createProfileController();
  app.put(Routes.Profile, Factory.createAuthMiddleware(), (request, response) =>
    profileController.update(request as AuthenticatedRequest, response)
  );
  return app;
}
