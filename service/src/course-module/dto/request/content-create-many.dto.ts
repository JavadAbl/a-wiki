import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class ContentCreateManyDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  titles: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  descriptions: string[];
}
