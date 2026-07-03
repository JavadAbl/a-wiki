import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure-modules/prsima-module/prisma.module';
import { UserModule } from './user-module/user.module';
import { ConfigModule } from '@nestjs/config';
import { appConfig, configValidationSchema } from './common/config/app.config';
import { AuthModule } from './auth-module/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './common/guards/authentication.guard';
import { AuthorizationGuard } from './common/guards/authorization.guard';
import { CourseModule } from './course-module/course.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true, // Allows variables not defined in schema
        abortEarly: true, // Stops validation on the first error
      },
    }),

    PrismaModule,
    AuthModule,
    UserModule,
    CourseModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
})
export class AppModule {}
