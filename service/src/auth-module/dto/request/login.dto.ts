import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  nationalCode: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
