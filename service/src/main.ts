import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, ConfigType } from './common/config/config.type';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/error-handler/error-handler.filter';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth-module/services/auth.service';
import { UserController } from './user-module/controllers/user.controller';
import { AuthController } from './auth-module/controllers/auth.controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);

  const authService = app.get<AuthService>(AuthService);
  authService.addControllerPermissions(AuthController);
  authService.addControllerPermissions(UserController);
  await authService.setupPermissions();

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = configService.get<AppConfig>('app')!.HTTP_PORT;

  await app.listen(port);
}

bootstrap();
