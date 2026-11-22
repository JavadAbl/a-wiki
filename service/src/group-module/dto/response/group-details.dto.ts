import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GroupDetailsDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string | null;

  @Expose()
  courseIds: number[];

  @Expose()
  categoryIds: number[];
}
