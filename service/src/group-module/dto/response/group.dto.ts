import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GroupDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string | null;
}
