import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PermissionType } from 'src/generated/prisma/enums';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  findFirstRolePermission(criteria: Prisma.RolePermissionFindFirstArgs) {
    return this.prismaProvider.rolePermission.findFirst(criteria);
  }

  createRolePermission(criteria: Prisma.RolePermissionCreateArgs) {
    return this.prismaProvider.rolePermission.create(criteria);
  }

  deleteRolePermission(criteria: Prisma.RolePermissionDeleteArgs) {
    return this.prismaProvider.rolePermission.delete(criteria);
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
}
