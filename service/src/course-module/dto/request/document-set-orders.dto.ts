import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class DocumentOrderDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  order: number;
}

export class DocumentSetOrdersDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => DocumentOrderDto)
  orders: DocumentOrderDto[];
}
