import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CourseCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description: string;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
