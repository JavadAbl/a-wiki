import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { IUserServiceContract, UserWithPermissions } from '../contracts/user-service.contract';

@Injectable()
export class UserServiceContract implements IUserServiceContract {
  constructor(private readonly userRep: UserRepository) {}

  userGetByUsername(username: string): Promise<UserWithPermissions | null> {
    return this.userRep.findUnique({
      where: { username },
      include: { userPermissions: { select: { permission: { select: { name: true } } } } },
    });
  }
}
