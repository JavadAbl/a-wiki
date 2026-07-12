import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CategoryCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description: string;
}
