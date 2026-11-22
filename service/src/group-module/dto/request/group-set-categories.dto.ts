import { ArrayMaxSize, IsArray, IsInt } from 'class-validator';

export class GroupSetCategoriesDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @IsInt({ each: true })
  categoryIds: number[];
}
