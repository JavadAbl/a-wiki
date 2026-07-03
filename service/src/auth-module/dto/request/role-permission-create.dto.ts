import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class RolePermissionCreateDto {
  @IsInt()
  @IsNotEmpty()
  permissionId: number;

  @IsEnum(Role)
  role: Role;
}
