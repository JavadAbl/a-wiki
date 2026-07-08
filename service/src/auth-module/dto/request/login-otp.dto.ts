import { IsString, IsNotEmpty } from 'class-validator';

export class LoginOtpDto {
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
