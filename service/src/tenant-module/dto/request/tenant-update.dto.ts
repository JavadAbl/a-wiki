import { TenantCreateDto } from './tenant-create.dto';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class TenantUpdateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  logoUrl: string;

  @IsInt()
  @IsOptional()
  order: number;
}
