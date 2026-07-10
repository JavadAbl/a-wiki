import { IsNotEmpty, IsInt } from 'class-validator';

export class PartSetViewDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
