import { IsBoolean } from 'class-validator';

export class CourseSetPublishedDto {
  @IsBoolean()
  isPublished: boolean;
}
