import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repository/user.repository';
import { PasswordService } from 'src/auth-module/services/password.service';
import { UserProvider } from './providers/user.service.provider';
import { UserServiceContract } from './contracts/user-service.contract';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    PasswordService,
    { provide: UserServiceContract, useClass: UserProvider },
  ],
  exports: [UserServiceContract],
})
export class UserModule {}
