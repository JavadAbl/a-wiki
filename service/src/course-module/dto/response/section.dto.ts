import { Exclude, Expose } from 'class-transformer';
import { PartDto } from './part.dto';

@Exclude()
export class SectionDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description?: string | null;

  @Expose()
  order: number;

  @Expose()
  parts: PartDto[];

  @Expose()
  totalContents: number;

  @Expose()
  totalContentsLength: number;
}
