import { Exclude, Expose } from 'class-transformer';
import { DocumentDto } from './document.dto';
import { SectionDto } from './section.dto';

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
  documents: DocumentDto[];

  @Expose()
  sections: SectionDto[];

  @Expose()
  lecturer?: string | null;

  @Expose()
  lecturerProfession?: string | null;

  @Expose()
  totalContents: number;

  @Expose()
  totalContentsLength: number;
}
