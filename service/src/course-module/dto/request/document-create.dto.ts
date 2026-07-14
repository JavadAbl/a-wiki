import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class DocumentCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string | null;

  /*  @Type(() => Number)
  @IsInt()
  contentOrder: number; */
}
