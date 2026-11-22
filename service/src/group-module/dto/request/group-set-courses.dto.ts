import { ArrayMaxSize, IsArray, IsInt } from 'class-validator';

export class GroupSetCoursesDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @IsInt({ each: true })
  courseIds: number[];
}
