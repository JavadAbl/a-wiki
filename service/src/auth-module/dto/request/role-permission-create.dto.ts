import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class RolePermissionCreateDto {
  @IsString()
  @IsNotEmpty()
  permissionName: string;

  @IsEnum(Role)
  role: Role;
}
