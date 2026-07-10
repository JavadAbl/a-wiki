import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserServiceContract, UserWithPermissions } from '../contracts/user-service.contract';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UserProvider implements UserServiceContract {
  constructor(private readonly userRep: UserRepository) {}
  userGetByMobile(mobile: string): Promise<UserWithPermissions | null> {
    return this.userRep.findUnique({
      where: { mobile },
      include: { userPermissions: { select: { permission: { select: { name: true } } } } },
    });
  }

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
