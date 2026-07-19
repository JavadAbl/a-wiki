import { IsString, MaxLength, IsOptional, IsInt } from 'class-validator';

export class ContentUpdateDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string | null;

  @IsInt()
  @IsOptional()
  order?: number;
}
