# Related Courses (دوره‌های مرتبط) Feature

## Design (confirmed with user)
- **New join table** `CourseRelatedCourse` — many-to-many: each course can have zero or more related courses, set by admin.
- **User-side layout change** (the bigger part): the 300px "سر فصل های دوره" sidebar is **completely replaced** by a "دوره‌های مرتبط" column. The parts view (`course-browser-parts.tsx`) is **renamed to "سرفصل های دوره"**, becomes **always visible without selecting a section**, and holds **all sections → parts → contents as nested tabs** (sections tabs at the top level, parts tabs as their children, and video/audio content tabs inside each part).
- **Admin-side**: a new "دوره‌های مرتبط" card on the `/Admin/Courses/:id` page with a multi-select course picker modal.

## Backend (`service/`)

1. **`prisma/schema.prisma`** — explicit join model (SQL Server can't do implicit self-M2M):
   ```prisma
   model CourseRelatedCourse {
     courseId        Int
     relatedCourseId Int
     course        Course @relation("courseRelatedCourses", fields: [courseId], references: [id], onDelete: Cascade)
     relatedCourse Course @relation("relatedToCourses",      fields: [relatedCourseId], references: [id], onDelete: Cascade)
     @@id([courseId, relatedCourseId])
   }
   ```
   plus `relatedCourses CourseRelatedCourse[] @relation("courseRelatedCourses")` and `relatedToCourses ... @relation("relatedToCourses")` on `Course`. Cascade both directions so deleting any course cleans up its relation rows.

2. **Migration** — same prod-safe workflow as the FavoriteCourse migration: `prisma migrate dev --create-only` fails on the prod server (no shadow-DB permission, error P3014), so generate SQL via read-only `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, write it as migration folder `2026xxxx_add_related_courses` (same `BEGIN TRY/BEGIN TRAN` style), review output, then `npx prisma migrate deploy` + `npx prisma generate`.

3. **`course-related-course.repository.ts`** — one-liner repository extending `Repository<'courseRelatedCourse'>`, registered in `course.module.ts`.

4. **`dto/request/course-set-related-courses.dto.ts`** — `{ relatedCourseIds: number[] }` with `@IsArray() @IsInt({ each: true })`.

5. **`course.service.ts`**:
   - `courseSetRelatedCourses(courseId, dto)` — course must exist; each id must exist and differ from `courseId`; replace-all in one `prisma.$transaction` (`deleteMany` where courseId + `createMany` of the new set) so the modal's save is idempotent.
   - `courseGetById` — add `include: { courseRelatedCourse: { include: { relatedCourse: true } } }`; map to `relatedCourses: CourseDto[]` reusing the existing `courseToDto` helper (with signed thumbnails; also run the existing totals `$queryRaw` over the related ids so counts are correct). Rows ordered by `relatedCourseId`.

6. **`dto/response/course-details.dto.ts`** — add `@Expose() relatedCourses: CourseDto[]`.

7. **`course.controller.ts`** — `@Admin() @Patch(':courseId/SetRelatedCourses')` next to `SetFavorite` (no GET-route collision; PATCH param routes are distinct).

## Frontend (`client/`)

8. **Types/API**: add `relatedCourses?: CourseDto[]` to `course.details.dto.ts`; add `CourseSetRelatedCourses: mutation<void, { body: { relatedCourseIds: number[] }; courseId: number }>` → `PATCH Courses/{id}/SetRelatedCourses`, `invalidatesTags: ["course"]`.

9. **User side — course-browser.tsx**:
   - Replace `<CourseBrowserSectionList course={course} />` with a new `CourseBrowserRelatedCourses` component in the 300px column.
   - Remove the auto-select-first-section `useEffect` (no longer needed — parts view shows everything). Keep the redux selections for content/player.
   - New `course-browser-related-courses.tsx`: same card style as the old section list (header + icon "دوره‌های مرتبط"), body = compact course cards (thumbnail, title, lecturer) reusing `courses-list-card.tsx` styling compacted for 300px; clicking navigates to `/Courses/{id}` (with the existing login-modal fallback pattern from other course cards). Empty state message when no related courses are set.

10. **User side — course-browser-parts.tsx** (the nested-tabs rework):
    - Rename trigger "انتخاب بخش ها" → "سرفصل های دوره".
    - The `parts` TabsContent becomes three nested tab levels driven by `selectedCourse.sections` (no redux section selection needed, so it renders immediately):
      - **Level 1 — sections tabs** (`TabsList variant="line"`), default = first section; local `useState` for active section id.
      - **Level 2 — parts tabs** for the active section (same tab style), default = first part; local state for active part.
      - **Level 3 — contents** inside the active part: keep the existing video/audio split (nested "ویدیوها"/"صوتی‌ها" tabs when both exist) and the existing `ContentItem` rows that dispatch `setCourseBrowserSelectedContent` (player behavior unchanged).
    - The existing `PartAccordion` accordion is retired in favor of the tabs; `openParts` state is removed.
    - Keep "درباره دوره" tab as-is.

11. **Admin side**:
    - New modal `components/course-set-related-courses.tsx` modeled on `course-set-category.tsx`: `Modal` + react-select with `isMulti`, options from `useCoursesGetManyAdminQuery({ pageSize: 1000 })` **excluding the current course**, initial values from `course.relatedCourses`, portal/fixed-position settings copied, save via the new mutation + close.
    - `admin-course.tsx`: new "دوره‌های مرتبط" `<Card>` (5th card, `Link2` icon) listing current related courses as removable chips, plus a "مدیریت" button opening the modal (wired with the page's existing `modalKeys` remount pattern).
    - `CourseDetailsDto` prop flows the current relations into the modal.

## Verification
- Migration SQL reviewed (single CREATE TABLE + two cascade FKs + composite PK), `migrate deploy` output confirms application.
- `nest build` + client `vite build`; `tsc -b` shows no new errors in changed files.
- API: `GET /api/Courses/:id` returns `relatedCourses` (empty array initially); unauthenticated `PATCH SetRelatedCourses` → 401; with admin token, set two related courses → visible in details response → home→ open course page.
- Manual: admin sets related courses on a course → user course page shows them in the right column with no section pre-selection needed; nested tabs: section tab → part tab → content click plays in the player as before.