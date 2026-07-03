import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class UserPermissionRepository extends Repository<'userPermission'> {
  constructor(prismaProvider: PrismaProvider) {
    super('userPermission', prismaProvider);
  }

  userPermissionCreate(criteria: Prisma.UserPermissionCreateArgs) {
    return this.create(criteria);
  }

  userPermissionDelete(criteria: Prisma.UserPermissionDeleteArgs) {
    return this.remove(criteria);
  }
}
