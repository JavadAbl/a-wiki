import { IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class LinkCreateDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @IsInt()
  @IsOptional()
  order: number;
}