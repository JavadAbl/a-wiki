import { IsString, IsNotEmpty, MaxLength, Length } from 'class-validator';

export class UserCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

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
  mobile: string;
}
