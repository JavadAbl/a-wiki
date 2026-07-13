import type { MediaType } from "../enums/media-type";

export interface ContentDto {
  id: number;
  title: string;
  mediaType: MediaType;
  description?: string | null;
  contentOrder: number;
}
