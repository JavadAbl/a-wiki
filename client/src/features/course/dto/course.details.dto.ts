import type { DocumentDto } from "./document.dto";
import type { SectionDto } from "./section.dto";

export interface CourseDetailsDto {
  id: number;
  title: string;
  description?: string | null;
  categoryId?: number | null;
  isPublished: boolean;
  thumbnailUrl?: string | null;
  documents: DocumentDto[];
  sections: SectionDto[];
  lecturer?: string | null;
  lecturerProfession?: string | null;
}
