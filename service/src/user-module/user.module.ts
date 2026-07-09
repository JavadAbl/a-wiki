import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repository/user.repository';
import { PasswordService } from 'src/auth-module/services/password.service';
import { IUserServiceContract } from './contracts/user-service.contract';
import { UserServiceContract } from './services/user.service.contract';
import { ITestServiceContract } from 'src/contract-module/contracts/test-service.contract';
import { TestService } from './services/test.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    { provide: IUserServiceContract, useClass: UserServiceContract },
    TestService,
    PasswordService,
  ],
  exports: [IUserServiceContract, TestService],
})
export class UserModule {}
