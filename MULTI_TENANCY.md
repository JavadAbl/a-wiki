# Multi-Tenancy

The app now supports **multiple tenant instances** in a single deployment: one
NestJS service, one SQL Server database, row-level tenant isolation. Each
tenant ("سامانه") has its own users, categories, courses, sections, parts,
contents, documents, links, favorites and progress. Visitors pick an instance
on the landing screen before anything else.

## How it works

### Data model (`service/prisma/schema.prisma`)

- New global model `Tenant` (name, slug, description, logoUrl, isActive, order).
- Every tenant-owned model carries a `tenantId` column:
  `User, Category, Link, Course, Document, Section, Part, Content,
  FavoriteCourse, PartView, CourseRelatedCourse`.
- `User.tenantId` is nullable: `NULL` marks the **global SuperAdmin** (seeded
  via `POST /Users/SuperAdmin`), who bypasses tenant scoping.
- Uniqueness moved from global to per-tenant:
  `User(nationalCode)`, `Category(name)`, `Course(title)` are now unique
  within a tenant (`@@unique([tenantId, ...])`).
- Migration `20261121000000_add_multi_tenancy` creates the `Tenant` table,
  inserts the default tenant (`id = 1`, slug `default`) and back-fills all
  existing rows into it, so a pre-multi-tenant deployment keeps working.

### Request flow

1. `main.ts` registers a plain Express middleware that seeds a per-request
   tenant store (AsyncLocalStorage, `common/tenant/tenant-context.ts`) from
   the `X-Tenant-Id` header.
2. Public routes (`Auth/Login`, `Auth/LoginOtp`, `Auth/Otp/Send`,
   `Tenants`, ...) run with that header tenant: login is scoped to the chosen
   instance. **Without the header only the global SuperAdmin can log in.**
3. `AuthenticationGuard` verifies the JWT and **overrides** the store with the
   token's `tenantId` (or marks it `bypass` for the global SuperAdmin). The JWT
   is authoritative — a user of tenant A can never see tenant B by faking the
   header. Tokens now carry `tenantId`.
4. `PrismaProvider` applies a Prisma client extension (`$extends`): for every
   tenant-scoped model it
   - ANDs `{ tenantId }` into every `where` (finds, counts, aggregates,
     updateMany, deleteMany, update, delete, upsert), and
   - stamps `tenantId` into every `create` / `createMany` / upsert-create
     when not set explicitly.
   Global models (`Tenant`, `Permission`, `RolePermission`, `UserPermission`)
   are untouched. Scoping happens in one place, so no service can leak data
   across tenants.
5. OTP cache keys are tenant-scoped (`t-<id>-otp-<mobile>`) so tenants never
   share codes.

### API

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /api/Tenants` | public | active instances for the selection screen |
| `GET /api/Tenants/All` | SuperAdmin | full list incl. inactive |
| `POST /api/Tenants` | SuperAdmin | create instance |
| `PATCH /api/Tenants/:id` | SuperAdmin | update instance |
| `PATCH /api/Tenants/:id/Active` | SuperAdmin | enable/disable |
| `DELETE /api/Tenants/:id` | SuperAdmin | delete (only when empty; `default` is protected) |

A new `SuperAdminGuard` (`@SA()` decorator) protects these; `AdminGuard`
remains for tenant admins, whose lists/CRUD are automatically scoped to their
own instance.

### Client

- Landing screen `/Tenants` (`pages/tenants/tenant-select.tsx`): grid of
  instances. `TenantGate` (mounted in `App.tsx`) renders it until an instance
  is chosen; the global SuperAdmin can enter without choosing one
  ("ورود مدیر سامانه").
- The selection is stored in `localStorage` (`storage.getTenant/setTenant`)
  and sent as `X-Tenant-Id` on every request (RTK Query `baseApi`, token
  refresh, authorized image fetches). Switching instances clears the session
  tokens and reloads.
- The navbar shows the current instance as a chip; clicking it opens
  `/Tenants` to switch.
- SuperAdmin gets a "سامانه‌ها" page under `/Admin/Tenants` for tenant CRUD.

## Deploying / operating

1. `prisma migrate deploy` (docker entrypoint already does this) applies the
   migration; existing data lands in the default tenant `نمونه پیش‌فرض`.
2. Log in as the seeded SuperAdmin (no tenant header → the "ورود مدیر سامانه"
   link on the selection screen) and manage instances under
   `/Admin/Tenants`.
3. Renaming the default tenant and adding more instances requires no downtime;
   new users are created per-instance by each instance's admin.

## Notes

- IDs remain global auto-increments (not per-tenant sequences); isolation is
  enforced by the query scope, not by ID ranges.
- The Prisma scope is bypassed only when the store is empty (bootstrap code,
  SuperAdmin bypass, anonymous requests without a header). Every
  authenticated request is pinned to its token's tenant.
- Pre-existing client `tsc` issues (35 errors, e.g. unused imports, missing
  `category.dto` module) are unchanged by this work; `vite build` and the
  service build pass cleanly.
