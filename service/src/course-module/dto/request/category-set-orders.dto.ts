import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class CategoryOrderDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  order: number;
}

export class CategorySetOrdersDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderDto)
  orders: CategoryOrderDto[];
}