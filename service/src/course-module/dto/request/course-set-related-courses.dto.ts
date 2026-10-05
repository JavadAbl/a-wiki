import { ArrayMaxSize, IsArray, IsInt } from 'class-validator';

export class CourseSetRelatedCoursesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  relatedCourseIds: number[];
}