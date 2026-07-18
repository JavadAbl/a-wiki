import { Exclude, Expose } from 'class-transformer';
import { ContentDto } from './content.dto';

@Exclude()
export class PartDto {
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

  @Expose()
  totalContents: number;

  @Expose()
  totalContentsLength: number;
}
