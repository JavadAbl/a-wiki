import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class CourseOrderDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  order: number;
}

export class CourseSetOrdersDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CourseOrderDto)
  orders: CourseOrderDto[];
}
