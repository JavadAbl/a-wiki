import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TenantDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string | null;

  @Expose()
  logoUrl?: string | null;

  @Expose()
  order: number;

  @Expose()
  isActive: boolean;
}

/// fields shown to anonymous visitors on the instance-selection screen
@Exclude()
export class TenantPublicDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string | null;

  @Expose()
  logoUrl?: string | null;
}
