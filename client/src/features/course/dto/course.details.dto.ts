import type { DocumentDto } from "./document.dto";
import type { SectionDto } from "./section.dto";
import type { CourseDto } from "./course.dto";

export interface CourseDetailsDto {
  id: number;
  title: string;
  description?: string | null;
  categoryId?: number | null;
  isPublished: boolean;
  thumbnailUrl?: string | null;
  documents: DocumentDto[];
  relatedCourses: CourseDto[];
  sections: SectionDto[];
  lecturer?: string | null;
  lecturerProfession?: string | null;
  totalContents: number;
  totalContentsLength: number;
}
