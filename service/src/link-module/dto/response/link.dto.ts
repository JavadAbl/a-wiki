import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LinkDto {
  @Expose()
  id: number;

  @Expose()
  title?: string | null;

  @Expose()
  url: string;

  @Expose()
  description?: string | null;

  @Expose()
  order: number;
}