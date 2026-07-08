import { Exclude, Expose } from 'class-transformer';
import { ContentDto } from './content.dto';

@Exclude()
export class SectionDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description?: string | null;

  @Expose()
  partOrder: number;

  @Expose()
  contents: ContentDto[];
}
