export interface CourseDto {
  id: number;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  categoryId?: number | null;
  isPublished?: boolean;
  lecturer?: string | null;
  lecturerProfession?: string | null;
  totalContents: number;
  totalContentsLength: number;
}
