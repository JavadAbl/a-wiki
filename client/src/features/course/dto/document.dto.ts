export interface DocumentDto {
  id: number;
  fileUrl: string;
  mimeType: string;
  description?: string | null;
}
