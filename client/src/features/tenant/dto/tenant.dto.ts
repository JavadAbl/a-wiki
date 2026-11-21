export type TenantDto = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  order: number;
  isActive: boolean;
};

/// fields returned by the public instance-selection endpoint
export type TenantPublicDto = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
};
