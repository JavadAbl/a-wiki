import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PartSetDescriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
