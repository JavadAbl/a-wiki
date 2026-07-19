import type { PartDto } from "./part.dto";

export interface SectionDto {
  id: number;
  title: string;
  description?: string | null;
  order: number;
  parts: PartDto[];
  totalContents: number;
  totalContentsLength: number;
}
