import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class RolePermissionRepository extends Repository<'rolePermission'> {
  constructor(prismaProvider: PrismaProvider) {
    super('rolePermission', prismaProvider);
  }

  rolePermissionFindFirst(criteria: Prisma.RolePermissionFindFirstArgs) {
    return this.findFirst(criteria);
  }

  rolePermissionFindById(id: number, criteria?: Prisma.RolePermissionFindUniqueArgs) {
    return this.findUnique({ ...criteria, where: { id } });
  }

  rolePermissionCreate(criteria: Prisma.RolePermissionCreateArgs) {
    return this.create(criteria);
  }

  rolePermissionDelete(criteria: Prisma.RolePermissionDeleteArgs) {
    return this.remove(criteria);
  }
}
