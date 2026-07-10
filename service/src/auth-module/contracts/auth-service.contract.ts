import { Role, RolePermission } from 'src/generated/prisma/client';

export abstract class AuthServiceContract {
  abstract rolePermissionFindByRoleAndPermissionName(
    role: Role,
    permissionName: string,
  ): Promise<RolePermission | null>;
}
