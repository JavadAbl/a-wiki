import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure-modules/prsima-module/prisma.module';
import { UserModule } from './user-module/user.module';
import { ConfigModule } from '@nestjs/config';
import { appConfig, configValidationSchema } from './common/config/app.config';
import { AuthModule } from './auth-module/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './common/guards/authentication.guard';
import { CourseModule } from './course-module/course.module';
import { LinkModule } from './link-module/link.module';
import { CacheModule } from '@nestjs/cache-manager';
import { S3Module } from './infrastructure-modules/s3-module/s3.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminGuard } from './common/guards/admin.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // The /static mount must be registered before the SPA client root:
    // the client config registers a catch-all GET route that serves index.html,
    // which would otherwise intercept /static/* requests and return HTML
    // for image files (blocked by browsers via ORB).
    ServeStaticModule.forRoot(
      { rootPath: join(process.cwd(), 'static'), serveRoot: '/static' },
      { rootPath: join(process.cwd(), 'client') },
    ),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true, // Allows variables not defined in schema
        abortEarly: true, // Stops validation on the first error
      },
    }),

    CacheModule.register({ isGlobal: true }),

    PrismaModule,
    S3Module,
    AuthModule,
    UserModule,
    CourseModule,
    LinkModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AdminGuard },
    /*   { provide: APP_GUARD, useClass: AuthorizationGuard }, */
  ],
})
export class AppModule {}
