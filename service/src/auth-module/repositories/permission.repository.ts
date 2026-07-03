import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PermissionType } from 'src/generated/prisma/enums';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class PermissionRepository extends Repository<'permission'> {
  constructor(prismaProvider: PrismaProvider) {
    super('permission', prismaProvider);
  }

  permissionFindById(id: number, criteria?: Prisma.PermissionFindUniqueArgs) {
    return this.findUnique({ ...criteria, where: { id } });
  }

  async syncPermissions(permissions: { name: string; type: PermissionType }[]) {
    // Use a transaction to ensure data integrity
    await this.prismaClient.$transaction(async (tx) => {
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
