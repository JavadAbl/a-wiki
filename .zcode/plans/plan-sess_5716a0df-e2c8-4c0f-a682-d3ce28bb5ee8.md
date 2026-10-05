# Favorite Courses (دوره‌های پرطرفدار) Feature

## Design
- **New `FavoriteCourse` table** (as requested — not a flag on Course): `id`, `courseId` (unique FK → Course, cascade delete), `order` (display order, default 0), timestamps. One row per favorite course; deleting a course automatically removes its favorite row.
- **Admin sets favorites per course** via a dropdown action on the admin courses table (toggle add/remove), mirroring the existing "تغییر وضعیت انتشار" pattern.
- **Home section** calls the new public endpoint; if no favorites are set yet, it falls back to the current behavior (first 3 published courses) so the homepage never goes blank.

## Backend (`service/`)

1. **`prisma/schema.prisma`** — add `FavoriteCourse` model (above) and `favorite FavoriteCourse?` relation on `Course`.

2. **Migration (your exact workflow — .env points at prod):**
   - `npx prisma migrate dev --create-only --name add_favorite_courses` — generates the SQL without applying anything to the DB. (Caveat: `migrate dev` needs to connect and may require shadow-DB permissions on the prod SQL Server; if that fails, fallback: generate the SQL with `npx prisma migrate diff --from-migrations ... --to-schema-datamodel prisma/schema.prisma --script` into the migration folder.)
   - Review the generated SQL with you, then `npx prisma migrate deploy` — applies pending migrations to the DB in `.env` (prod) the way the Docker entrypoint does in production.
   - `npx prisma generate` to refresh the generated client types.

3. **`favorite.repository.ts`** — new repository extending `Repository<'favoriteCourse'>` (same minimal pattern as `course.repository.ts`).

4. **`course.service.ts`** — two methods:
   - `courseSetFavorite(courseId, { isFavorite })` — check course exists; add (`order` = current max + 1) or remove the `FavoriteCourse` row; idempotent-friendly (removing a non-favorite → BadRequestException like `courseSetPublished`, adding a duplicate → already-favorite message).
   - `courseGetManyFavorites(limit)` — fetch favorite rows ordered by `order`, then reuse the existing DTO mapping (I'll extract the shared thumbnail-signing + totals-aggregation mapping from `courseGetMany` into a private helper so both endpoints stay in sync), filter to `isPublished: true`, return `CourseDto[]` capped at a limit (default 12, home shows 3).

5. **`course.controller.ts`** (`@Controller('Courses')`):
   - `@Public() @Get('/Favorites')` → `courseGetManyFavorites()` (public — anonymous home visitors need it).
   - `@Admin() @Patch(':courseId/SetFavorite')` with `CourseSetFavoriteDto` (`{ isFavorite: boolean }`, same shape as `CourseSetPublishedDto`).
   Route ordering note: `/Favorites` must be declared before the `:courseId` param route so `Favorites` isn't captured as an id.

6. **DTOs** — `dto/request/course-set-favorite.dto.ts`; add `isFavorite?: boolean` to the response `CourseDto` (admin list joins the favorite table so the UI can show current state).

## Frontend (`client/`)

7. **`course-api.ts`** — new tag `"favoriteCourse"`:
   - `CoursesGetManyFavorites: query<CourseDto[], void>` → `GET Courses/Favorites`.
   - `CourseSetFavorite: mutation<void, { body: { isFavorite: boolean }; courseId: number }>` → `PATCH Courses/{id}/SetFavorite`, invalidates `["course", "favoriteCourse"]`.
   - Export `useCoursesGetManyFavoritesQuery`, `useCourseSetFavoriteMutation`.

8. **`home-courses.tsx`** — switch to `useCoursesGetManyFavoritesQuery()`; render the favorites (slice 3), falling back to `useCoursesGetManyQuery()`'s first 3 only when the favorites list is empty.

9. **Admin page** (`admin-panel-courses.tsx`):
   - Add a dropdown item "افزودن به پرطرفدارها" / "حذف از پرطرفدارها" (Star / StarOff icon) that calls `CourseSetFavorite` directly (no modal needed for a toggle) with success/error toast — same inline pattern as delete.
   - Show a small star `Badge` (variant secondary) next to the status badge when `row.original.isFavorite`, so admins see current state at a glance.

## Verification
- Migration: inspect generated SQL (CREATE TABLE FavoriteCourse + FK + unique index), then `migrate deploy` result shows applied.
- `nest build` + client `tsc`/`vite build`.
- Manual: toggle favorite on a course in admin → home section shows it in the chosen order; delete a favorited course → row auto-removed (cascade); anonymous reload still sees section.