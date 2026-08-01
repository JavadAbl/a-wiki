import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ContentDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  mediaType: string;

  @Expose()
  description?: string | null;

  @Expose()
  order: number;

  @Expose()
  durationSeconds: number;
}
