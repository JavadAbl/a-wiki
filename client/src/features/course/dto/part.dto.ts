import type { ContentDto } from "./content.dto";

export interface PartDto {
  id: number;
  title: string;
  description?: string | null;
  order: number;
  contents: ContentDto[];
  totalContents: number;
  totalContentsLength: number;
}
