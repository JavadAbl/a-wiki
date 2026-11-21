import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class TenantCreateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  /// unique URL-friendly identifier, also shown as the instance handle
  @IsString()
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{1,48}[a-zA-Z0-9])?$/, {
    message: 'slug must be 3-50 latin letters, digits, - or _',
  })
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

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
