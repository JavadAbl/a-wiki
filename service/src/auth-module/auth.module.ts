import { Module } from '@nestjs/common';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PasswordService } from 'src/common/services/password.service';
import { ITokenService } from './contracts/token-service.contract';
import { TokenService } from './services/token.service';
import { UserModule } from 'src/user-module/user.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthService,
    PasswordService,
    { provide: ITokenService, useClass: TokenService },
  ],
  exports: [AuthService],
})
export class AuthModule {}
