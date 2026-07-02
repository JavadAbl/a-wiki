import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repository/user.repository';
import { PasswordService } from 'src/common/services/password.service';
import { IUserServiceContract } from './contracts/user-service.contract';
import { UserServiceContract } from './services/user.service.contract';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    { provide: IUserServiceContract, useClass: UserServiceContract },
    PasswordService,
  ],
  exports: [IUserServiceContract],
})
export class UserModule {}
