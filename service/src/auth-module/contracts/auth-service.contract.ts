import { RolePermission } from 'src/generated/prisma/client';
import { Role } from '../enums/role.enum';

export abstract class AuthServiceContract {
  abstract rolePermissionFindByRoleAndPermissionName(
    role: Role,
    permissionName: string,
  ): Promise<RolePermission | null>;
}
