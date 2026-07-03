import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { IUserServiceContract, UserWithPermissions } from '../contracts/user-service.contract';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UserServiceContract implements IUserServiceContract {
  constructor(private readonly userRep: UserRepository) {}

  userGetById(id: number): Promise<User | null> {
    return this.userRep.findUnique({ where: { id } });
  }

  userGetByUsername(username: string): Promise<UserWithPermissions | null> {
    return this.userRep.findUnique({
      where: { username },
      include: { userPermissions: { select: { permission: { select: { name: true } } } } },
    });
  }
}
