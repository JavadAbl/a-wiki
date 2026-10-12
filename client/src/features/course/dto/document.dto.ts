export interface DocumentDto {
  id: number;
  fileUrl: string;
  fileSize: number;
  title: string;
  order: number;
  description?: string | null;
}
