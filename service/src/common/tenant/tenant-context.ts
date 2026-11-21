import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export type TenantStore = {
  /** tenant resolved from the X-Tenant-Id header (public requests) */
  tenantId?: number;
  /** when true, queries are NOT scoped to a tenant (global SuperAdmin / system calls) */
  bypass?: boolean;
};

/**
 * Holds the tenant of the current request via AsyncLocalStorage so that the
 * Prisma extension can scope every query without touching service code.
 *
 * Resolution order:
 * 1. TenantMiddleware seeds the store from the `X-Tenant-Id` header (public routes: login, tenants list, ...).
 * 2. AuthenticationGuard overrides the store with the JWT `tenantId` (authenticated requests),
 *    or marks the request as `bypass` for the global SuperAdmin.
 */
@Injectable()
export class TenantContext {
  private readonly als = new AsyncLocalStorage<TenantStore>();

  run<T>(store: TenantStore, callback: () => T): T {
    return this.als.run(store, callback);
  }

  getStore(): TenantStore | undefined {
    return this.als.getStore();
  }

  /** tenant id of the current request; undefined when no tenant chosen (or bypassed) */
  get tenantId(): number | undefined {
    const store = this.getStore();
    if (!store || store.bypass) return undefined;
    return store.tenantId;
  }

  get isBypassed(): boolean {
    return !!this.getStore()?.bypass;
  }

  /** called by AuthenticationGuard: the JWT is authoritative over the header */
  overrideFromToken(token: { tenantId?: number | null }): void {
    const store = this.getStore();
    if (!store) return;

    if (token.tenantId == null) {
      // global user (seeded SuperAdmin) -> see across tenants
      store.tenantId = undefined;
      store.bypass = true;
    } else {
      store.tenantId = token.tenantId;
      store.bypass = false;
    }
  }

  /** tenant-scoped cache key so tenants never share cached values (OTP codes, ...) */
  scopedKey(key: string): string {
    const id = this.tenantId;
    return id == null ? `t-g-${key}` : `t-${id}-${key}`;
  }

  /**
   * Guards against cross-tenant lookups when the Prisma scope could not do it
   * (no tenant context: anonymous requests without the X-Tenant-Id header, or
   * bypassed global SuperAdmin). With a tenant context the Prisma extension
   * already guarantees a match, so this stays true.
   */
  matchesTenant(entityTenantId: number | null | undefined): boolean {
    const t = this.tenantId;
    if (t != null) return entityTenantId === t;
    return entityTenantId == null;
  }
}
