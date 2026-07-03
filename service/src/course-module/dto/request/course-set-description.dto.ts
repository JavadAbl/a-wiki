import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CourseSetDescriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
