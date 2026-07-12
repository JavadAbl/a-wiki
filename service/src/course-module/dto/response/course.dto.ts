import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CourseDto {
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
  lecturer?: string | null;

  @Expose()
  lecturerProfession?: string | null;

  @Expose()
  totalContents: number;

  @Expose()
  totalContentsLength: number;
}
