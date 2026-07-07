import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SectionSetDescriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
