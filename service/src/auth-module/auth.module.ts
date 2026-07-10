import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PasswordService } from 'src/auth-module/services/password.service';
import { ITokenService } from './contracts/token-service.contract';
import { TokenService } from './services/token.service';
import { UserPermissionRepository } from './repositories/user-permission.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { UserModule } from 'src/user-module/user.module';
import { AuthServiceContract } from './contracts/auth-service.contract';
import { AuthProvider } from './providers/auth-provider';

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
    { provide: AuthServiceContract, useClass: AuthProvider },
  ],
  exports: [ITokenService, AuthServiceContract],
})
export class AuthModule {}
