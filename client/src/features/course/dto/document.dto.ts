export interface DocumentDto {
  id: number;
  fileUrl: string;
  fileSize: number;
  order: number;
  title: string;
  description?: string | null;
}
