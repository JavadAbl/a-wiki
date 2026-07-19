import { Exclude, Expose } from 'class-transformer';
import { MediaType } from 'src/generated/prisma/enums';

@Exclude()
export class ContentDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  mediaType: MediaType;

  @Expose()
  description?: string | null;

  @Expose()
  order: number;
}
