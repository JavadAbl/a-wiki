import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DocumentDto {
  @Expose()
  id: number;

  @Expose()
  fileUrl: string;

  @Expose()
  fileSize: number;

  @Expose()
  order: number;

  @Expose()
  description?: string | null;
}
