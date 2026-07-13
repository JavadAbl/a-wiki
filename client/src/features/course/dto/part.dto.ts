import type { ContentDto } from "./content.dto";

export interface PartDto {
  id: number;
  title: string;
  description?: string | null;
  partOrder: number;
  contents: ContentDto[];
}
