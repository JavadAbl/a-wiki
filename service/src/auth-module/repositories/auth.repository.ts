import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PermissionType } from 'src/generated/prisma/enums';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  //Permission-----------------------------------------------
  permissionFindById(id: number, criteria?: Prisma.PermissionFindUniqueArgs) {
    return this.prismaProvider.permission.findUnique({ ...criteria, where: { id } });
  }

  async syncPermissions(permissions: { name: string; type: PermissionType }[]) {
    // Use a transaction to ensure data integrity
    await this.prismaProvider.$transaction(async (tx) => {
      // 1. Extract the names of the incoming permissions
      const incomingNames = permissions.map((p) => p.name);

      // 2. Delete permissions that are NOT in the incoming array
      // This handles the requirement: "if there is extra permission that doesnt exists in array should be removed"
      await tx.permission.deleteMany({ where: { name: { notIn: incomingNames } } });

      // 3. Upsert (Update or Insert) the incoming permissions
      // This handles the requirement: "new permissions should be inserted"
      // It also handles cases where the permission exists but the 'Type' might have changed.
      for (const permission of permissions) {
        await tx.permission.upsert({
          where: { name: permission.name },
          update: { type: permission.type }, // Update type if it changed
          create: { name: permission.name, type: permission.type },
        });
      }
    });
  }

  //RolePermission-----------------------------------------------
  rolePermissionFindFirst(criteria: Prisma.RolePermissionFindFirstArgs) {
    return this.prismaProvider.rolePermission.findFirst(criteria);
  }

  rolePermissionFindById(id: number, criteria?: Prisma.RolePermissionFindUniqueArgs) {
    return this.prismaProvider.rolePermission.findUnique({ ...criteria, where: { id } });
  }

  rolePermissionCreate(criteria: Prisma.RolePermissionCreateArgs) {
    return this.prismaProvider.rolePermission.create(criteria);
  }

  rolePermissionDelete(criteria: Prisma.RolePermissionDeleteArgs) {
    return this.prismaProvider.rolePermission.delete(criteria);
  }

  //UserPermission-----------------------------------------------
  userPermissionCreate(criteria: Prisma.UserPermissionCreateArgs) {
    return this.prismaProvider.userPermission.create(criteria);
  }

  userPermissionDelete(criteria: Prisma.UserPermissionDeleteArgs) {
    return this.prismaProvider.userPermission.delete(criteria);
  }
}
