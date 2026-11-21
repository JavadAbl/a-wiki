import { SetMetadata } from '@nestjs/common';

export const SA_KEY = 'sa';

/** Marks a route as SuperAdmin-only (enforced by SuperAdminGuard) */
export const SA = () => SetMetadata(SA_KEY, true);
