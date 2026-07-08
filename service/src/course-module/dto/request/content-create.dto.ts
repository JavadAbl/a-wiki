import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt } from 'class-validator';

export class ContentCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string | null;

  @IsInt()
  contentOrder: number;
}
