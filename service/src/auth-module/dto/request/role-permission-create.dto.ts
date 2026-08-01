import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Role } from 'src/auth-module/enums/role.enum';

export class RolePermissionCreateDto {
  @IsInt()
  @IsNotEmpty()
  permissionId: number;

  @IsEnum(Role)
  role: Role;
}
