import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, ConfigType } from './common/config/config.type';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/error-handler/error-handler.filter';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth-module/services/auth.service';
import { UserController } from './user-module/controllers/user.controller';
import { AuthController } from './auth-module/controllers/auth.controller';
import { TenantContext } from './common/tenant/tenant-context';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);

  // Per-request tenant store, seeded from the X-Tenant-Id header.
  // Registered as plain Express middleware so it wraps every Nest route
  // (guaranteed ordering; AuthenticationGuard later overrides the store
  // with the JWT tenant for authenticated requests).
  const tenantContext = app.get(TenantContext);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const raw = req.headers['x-tenant-id'];
    const tenantId = raw ? Number(Array.isArray(raw) ? raw[0] : raw) : NaN;
    const store = Number.isInteger(tenantId) && tenantId > 0 ? { tenantId } : {};
    tenantContext.run(store, () => next());
  });

  const authService = app.get<AuthService>(AuthService);
  authService.addControllerPermissions(AuthController);
  authService.addControllerPermissions(UserController);
  await authService.setupPermissions();

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  app.enableCors({ origin: '*' });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }));

  const port = configService.get<AppConfig>('app')!.HTTP_PORT;

  await app.listen(port);
}

bootstrap();
