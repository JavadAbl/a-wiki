import { IsString, IsNotEmpty, MaxLength, Length, IsOptional } from 'class-validator';

export class UserCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @Length(11)
  @IsOptional()
  mobile?: string | null;

  @IsString()
  @Length(10)
  nationalCode: string;
}
