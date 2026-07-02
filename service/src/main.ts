import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, ConfigType } from './common/config/config.type';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/error-handler/error-handler.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<AppConfig>('app')!.HTTP_PORT;

  await app.listen(port);
}
bootstrap();
