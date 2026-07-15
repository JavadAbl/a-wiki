import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CategoryUpdateDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description: string;
}
