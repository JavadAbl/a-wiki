import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { PasswordService } from 'src/common/services/password.service';
import { IUserServiceContract } from '../contracts/user-service.contract';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UserServiceContract implements IUserServiceContract {
  constructor(
    private readonly userRep: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  userGetByUsername(username: string): Promise<User | null> {
    return this.userRep.findUnique({ where: { username } });
  }
}
