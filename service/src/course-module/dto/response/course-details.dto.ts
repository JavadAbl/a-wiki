import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CourseDetailsDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description?: string | null;

  @Expose()
  categoryId?: number | null;

  @Expose()
  isPublished: boolean;

  @Expose()
  thumbnailUrl?: string | null;

  @Expose()
  documents: any[];

  @Expose()
  sections: any[];
}
