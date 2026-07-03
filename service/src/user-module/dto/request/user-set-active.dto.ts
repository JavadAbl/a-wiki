import { IsBoolean } from 'class-validator';

export class UserSetActiveDto {
  @IsBoolean()
  isActive: boolean;
}
