import { Module } from '@nestjs/common';
import { UserController } from './contollers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repository/user.repository';
import { PasswordService } from 'src/common/services/password.service';

@Module({
  imports: [PasswordService],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
