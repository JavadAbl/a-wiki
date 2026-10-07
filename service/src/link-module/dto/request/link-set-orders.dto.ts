import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class LinkOrderDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  order: number;
}

export class LinkSetOrdersDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => LinkOrderDto)
  orders: LinkOrderDto[];
}