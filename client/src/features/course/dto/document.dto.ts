export interface DocumentDto {
  id: number;
  fileUrl: string;
  fileSize: number;
  title: string;
  description?: string | null;
}
