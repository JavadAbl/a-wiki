import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class GroupUpdateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string | null;
}
