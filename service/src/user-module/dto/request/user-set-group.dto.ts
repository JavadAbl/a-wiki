import { IsInt, IsOptional } from 'class-validator';

export class UserSetGroupDto {
  @IsInt()
  @IsOptional()
  groupId: number | null;
}
