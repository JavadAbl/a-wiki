import { IsInt, IsNotEmpty } from 'class-validator';

export class UserPermissionCreateDto {
  @IsInt()
  @IsNotEmpty()
  permissionId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
