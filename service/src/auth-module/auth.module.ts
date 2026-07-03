import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PasswordService } from 'src/auth-module/services/password.service';
import { ITokenService } from './contracts/token-service.contract';
import { TokenService } from './services/token.service';
import { UserModule } from 'src/user-module/user.module';
import { UserPermissionRepository } from './repositories/user-permission.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    UserPermissionRepository,
    RolePermissionRepository,
    PermissionRepository,
    AuthService,
    PasswordService,
    { provide: ITokenService, useClass: TokenService },
  ],
  exports: [AuthService],
})
export class AuthModule {}
