import { IsString, MaxLength, Length, IsOptional, IsBoolean } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
