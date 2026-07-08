import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DocumentDto {
  @Expose()
  id: number;

  @Expose()
  fileUrl: string;

  @Expose()
  mimeType: string;

  @Expose()
  description?: string | null;
}
