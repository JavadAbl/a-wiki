import { ArrayMaxSize, IsArray, IsInt, IsOptional } from 'class-validator';

export class UserSetGroupBulkDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsInt({ each: true })
  userIds: number[];

  @IsInt()
  @IsOptional()
  groupId: number | null;
}
