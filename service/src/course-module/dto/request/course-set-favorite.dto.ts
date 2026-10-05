import { IsBoolean } from 'class-validator';

export class CourseSetFavoriteDto {
  @IsBoolean()
  isFavorite: boolean;
}