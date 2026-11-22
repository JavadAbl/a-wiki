# Add User Groups with Course/Category Access Rules

## Context

`a-wiki` is a Persian LMS (NestJS + Prisma/SQL Server backend, React + RTK Query frontend). Access to learning content is global today: `Course.isPublished` is the only visibility flag, enforced in `course.service.ts:210-233` (public vs admin list) and `:325-331` (favorites). There is no enrollment, assignment, or group model; `User` has only `role` + optional per-user permissions (the fine-grained `AuthorizationGuard` is disabled at `app.module.ts:54`).

The request: introduce **user groups** — an admin assigns each user to at most one group; each group has an allowlist of courses and categories; users with **no** group keep today's unrestricted behavior, while group members see only content allowed by their group.

Confirmed decisions:
- **Allowlist**: a group lists courses/categories its members *may* access. Not listed = hidden. A new/empty group sees nothing.
- **Category grants its courses**: a course is visible if its ID is in the group's course list **OR** its `categoryId` is in the group's category list (union).
- **Enforce on**: `GET /Courses` (lists/search), favorites, `GET /Courses/:courseId`, and the content presigned-URL endpoint. `GET /Categories` stays public/unfiltered. Admins/SuperAdmins bypass all group rules.
- **Assignment UI**: both a group dropdown in user create/edit modals **and** a bulk "change group" action on the users table.
- **Verification uses the dev `.env` only** — see Verification.

## Recommended approach

### 1. Data model — `service/prisma/schema.prisma` + new migration

Add three models and one relation, matching existing naming/relation style:

```prisma
model Group {
  id          Int             @id() @default(autoincrement())
  name        String          @unique()
  description String?
  users       User[]
  courses     GroupCourse[]
  categories  GroupCategory[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
model GroupCourse {         // @@unique([groupId, courseId]), FKs onDelete: Cascade
  group Group; course Course; groupId Int; courseId Int; createdAt/updatedAt
}
model GroupCategory {       // @@unique([groupId, categoryId]), FKs onDelete: Cascade
  group Group; category Category; groupId Int; categoryId Int; createdAt/updatedAt
}
```
Add `groupId Int?` + `group Group? @relation(fields: [groupId], references: [id], onDelete: SetNull)` to `User`.

Create `service/prisma/migrations/<timestamp>_add_user_groups/migration.sql` following the existing MSSQL `BEGIN TRY / BEGIN TRAN / COMMIT / CATCH THROW` style (`20261012120000_document_add_order/migration.sql`). Run `npx prisma generate` and commit regenerated `service/src/generated/prisma`.

### 2. New backend `GroupModule` — `service/src/group-module/`

Mirror the controller → service → repository → DTO layering of `user-module` / `course-module`:

- `repositories/group.repository.ts`, `group-course.repository.ts`, `group-category.repository.ts` — thin subclasses of generic `Repository<'group'>` etc. (`base.repository.ts`).
- `dto/request/`: `group-create.dto.ts`, `group-update.dto.ts` (name/description), `group-set-courses.dto.ts`, `group-set-categories.dto.ts` (`courseIds` / `categoryIds: number[]`, size-capped).
- `dto/response/group.dto.ts` + `group-details.dto.ts` with `@Exclude/@Expose`, matching `user.dto.ts`.
- `controllers/group.controller.ts` — `@Controller('Groups')`, all endpoints `@Admin()`: `GET /Groups`, `GET /Groups/:id`, `POST /Groups`, `PATCH /Groups/:id`, `DELETE /Groups/:id`, `PATCH /Groups/:id/SetCourses`, `PATCH /Groups/:id/SetCategories`. Literal paths before `:id`.
- `services/group.service.ts` — CRUD + rule setters (validate IDs, replace rule rows in a `$transaction`, mirroring `category.service.ts:36-51`).
- `services/access.service.ts` — shared access resolver used by course code:
  - `resolveRestriction(context?: TokenPayload): Promise<{ courseIds: Set<number>, categoryIds: Set<number> } | null>` — `null` = unrestricted. Returns `null` for no context, Admin/SuperAdmin, or a user with no `groupId`; otherwise loads the group's rule rows via Prisma.
  - `isCourseAllowed(restriction, course)` — course ID match OR category ID match (union).
  - `courseWhere(restriction)` — `OR: [{ id: { in: [...] } }, { categoryId: { in: [...] } }]` for list queries.
- Register in `app.module.ts` imports; export `AccessService` from `GroupModule`, import `GroupModule` in `CourseModule` (`course.module.ts`). No circular dependency (GroupModule depends only on global PrismaModule).

### 3. Optional auth on public endpoints

`AuthenticationGuard` (`authentication.guard.ts:15-33`) short-circuits `@Public()` routes, so `request.user` is unset. Change it so that on public routes **if** an `Authorization` header is present and verifies, `request.user` is still populated (ignore missing/invalid tokens); non-public behavior unchanged. This lets `courseGetMany` and favorites honor group rules for logged-in users while anonymous visitors remain unrestricted. Controllers pass `@User() context: TokenPayload` (or `context?` on public routes) into services. `groupId` is resolved from the DB in `AccessService` (no need to add it to `TokenPayload`), so group changes apply immediately.

### 4. Course-side enforcement — `service/src/course-module/`

- `services/course.service.ts`
  - `courseGetMany(query, adminCourses, categoryId, context?)`: keep existing `isPublished` logic; when `!adminCourses`, merge `access.courseWhere(restriction)` into `where` alongside `categoryId`/search. Admin path untouched.
  - `courseGetManyFavorites()`: apply the same restriction to the favorite `where` (`:326-331`).
  - `courseGetById(id, context?)`: after loading the course, if restricted and not allowed → `ForbiddenException`; filter related-course DTOs with the same rule.
- `controllers/course.controller.ts`
  - `GET /Courses` (`:64-71`), `GET /Favorites` (`:83-87`), `GET /:courseId` (`:114-117`): accept `@User() context?: TokenPayload`, pass to services.
- `services/content.service.ts` / `controllers/course.controller.ts`
  - `generatePresignedUrl(contentId, context?)`: after loading content (`:237-245`), resolve part → section → `courseId` (reuse `include` pattern at `:24-30`), enforce access → `ForbiddenException`. Pass `@User()` from `GET /Courses/Contents/:contentId/URL` (`:275-278`).

Keep `isPublished` behavior as-is; do not fix unrelated pre-existing bugs (e.g. `partSetView` param mismatch) unless they block this feature.

### 5. User assignment — backend

- Add optional `groupId?: number | null` to `user-create.dto.ts` and `user-update.dto.ts` with `@IsOptional() @IsInt()`.
- `services/user.service.ts`: in `userCreate`/`userUpdate`, validate a non-null `groupId` exists (`userRep.prismaClient.group.findUnique`, else `BadRequestException`) and persist it.
- New `PATCH /Users/:id/SetGroup` (body `{ groupId: number | null }`) and `PATCH /Users/SetGroupBulk` (body `{ userIds: number[], groupId: number | null }`) in `user.controller.ts` + service; bulk uses `updateMany`. Mark `@Admin()`. Do **not** retroactively secure the legacy user CRUD routes.
- `user.dto.ts` (backend) + `client/src/features/user/dto/user.dto.ts`: expose `groupId: number | null`.

### 6. Frontend — `client/src/`

- New `src/features/group/`: `dto/group.dto.ts`, `schemas/group-create.schema.ts` / `group-update.schema.ts` (Zod), `group-api.ts` (RTK Query slice: `GroupGetMany`, `GroupGetById`, `GroupCreate`, `GroupUpdate`, `GroupDelete`, `GroupSetCourses`, `GroupSetCategories`; tag `"group"`). Register reducer in `src/features/store.ts`.
- Add `UserSetGroup` / `UserSetGroupBulk` mutations to `src/features/user/user-api.ts`.
- New admin page `src/pages/admin-panel/admin-groups/admin-panel-groups.tsx` following `admin-panel-categories.tsx`: DataGrid of groups + create/edit modal with name/description, category multi-select and course multi-select (courses grouped by category), delete action. Reuse existing Modal/Field/Button/Badge primitives; no new UI library.
- Add `Groups` route in `admin-panel-routes.tsx` and a "گروه ها" nav link in `admin-sidebar.tsx` (pattern at `:81-94`).
- User create/edit modals (`user-create.tsx`, `user-update.tsx`): add a group dropdown from `useGroupGetManyQuery` with a "بدون گروه" option; include `groupId` in payloads and Zod schemas.
- Users table (`admin-panel-users.tsx`): add a "گروه" column (map `groupId` to names), enable `DataGrid` row selection (`enableRowSelection` + `onRowSelectionChange` at `data-grid.tsx:28,72,128-136`) with a checkbox column, and a "تغییر گروه" bulk button calling `UserSetGroupBulk`. Batch Excel upload stays group-less; admins bulk-assign afterwards.

## Verification (dev `.env` only — never prod)

Use the **dev** config file `service/.env` for every backend test/run. Do **not** use `service/.env.prod` or the prod-oriented `service/compose.yml` (its `env_file` is `.env.prod`). If `.env` is missing, create it from the documented dev variables in `service/src/common/config/app.config.ts` with a `DATABASE_URL` pointing at the local SQL Server.

1. Start **only** the database: `docker compose -f "service/compose sql only.yml" up -d` (no app/nginx, no prod env).
2. Backend (dev env is auto-loaded by `ConfigModule` from `.env`): `cd service && npx prisma generate && npx prisma migrate dev --name add_user_groups && npm run dev`, then in another shell `npm test`. Run `npm run build` as a compile check.
3. Frontend dev: `cd client && npm install && npm run dev`; if not proxying through nginx, temporarily point `BASE_ADDRESS` back to `http://localhost:3000/api/` as shown in `client/src/features/base-api.ts`. Run `npm run build` and `npm run lint` as checks. Do not use the prod deploy path.
4. Manual end-to-end against the dev stack (backend on dev `:3000`, Vite dev server):
   - Create group G allowing category C1 and course X (in category C2); create user A in G and user B with no group.
   - As **A**: `GET /Courses` shows only courses in C1 plus X; `GET /Courses/:id` and `GET /Courses/Contents/:contentId/URL` return 403 for a disallowed course; favorites only show allowed courses.
   - As **B** (no group) and **anonymous**: full published course list, detail and media URLs work as before.
   - As **Admin/SuperAdmin**: all courses visible regardless of group rules.
   - Change A's group via the edit modal and via the bulk action; access changes immediately without re-login.
   - Delete group G → A's `groupId` becomes null and A regains unrestricted access (`onDelete: SetNull`).
