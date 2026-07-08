import { Exclude, Expose } from 'class-transformer';
import { CourseDetailsDto } from './course-details.dto';

@Exclude()
export class UserCourseDetailsDto {
  @Expose()
  id: number;

  @Expose()
  course: CourseDetailsDto;
}
