import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class UserSetActiveDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsBoolean()
  isActive: boolean;
}
