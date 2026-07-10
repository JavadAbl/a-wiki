import { Injectable } from '@nestjs/common';
import { Role } from 'src/generated/prisma/enums';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { AuthServiceContract } from '../contracts/auth-service.contract';
import { RolePermission } from 'src/generated/prisma/client';

@Injectable()
export class AuthProvider implements AuthServiceContract {
  constructor(private readonly rolePermissionRep: RolePermissionRepository) {}

  rolePermissionFindByRoleAndPermissionName(
    role: Role,
    permissionName: string,
  ): Promise<RolePermission | null> {
    return this.rolePermissionRep.rolePermissionFindFirst({
      where: { role, permissionName: { contains: permissionName } },
    });
  }
}
