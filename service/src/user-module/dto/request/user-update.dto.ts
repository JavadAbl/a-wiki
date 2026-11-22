import { IsString, MaxLength, Length, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsOptional()
  @Length(11)
  mobile: string;

  @IsString()
  @IsOptional()
  @Length(10)
  nationalCode: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsInt()
  @IsOptional()
  groupId?: number | null;
}
