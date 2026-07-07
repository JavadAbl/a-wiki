import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SectionDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description?: string | null;

  @Expose()
  sectionOrder: number;

  @Expose()
  parts: any[];
}
