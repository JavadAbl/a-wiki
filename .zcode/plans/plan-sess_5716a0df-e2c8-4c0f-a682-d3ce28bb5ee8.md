# Course Order Feature (mirror of Category order)

Same design the user chose for categories: `order Int @default(0)` on Course; all course lists sort by it; admin reorders via **drag-and-drop rows in the admin courses table with pagination removed** (per your earlier instruction pattern: "drag and drop but u should remove pagination from table to do this"). No order field in create/edit modals.

## Backend (`service/`)

1. **`prisma/schema.prisma`** — add `order Int @default(0)` to the Course model.
2. **Migration** — established prod-safe workflow: read-only `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script --exit-code` (with DATABASE_URL in shell), hand-write migration folder `2026xxxx_course_add_order` in the `BEGIN TRY/BEGIN TRAN/.../THROW` style:
   ```sql
   ALTER TABLE [dbo].[Course] ADD [order] INT NOT NULL CONSTRAINT [Course_order_df] DEFAULT 0;
   ```
   then `npx prisma migrate deploy` + `npx prisma generate`.
3. **`course.service.ts`**:
   - `courseGetMany` — replace the hard-coded `orderBy: { id: 'desc' }` (line ~222) with the category pattern: `predicate.orderBy ?? [{ order: 'asc' }, { id: 'asc' }]` (typed `CourseOrderByWithRelationInput[]`, imported from `src/generated/prisma/models/Course`).
   - Same default sort in `courseGetManyAdmin` (the endpoint the admin table uses).
   - New `courseSetOrders(orders: {id, order}[])` — validate all ids exist (count), then one `prisma.$transaction` of updates. Copy of `categorySetOrders`.
4. **`course.controller.ts`** — new `@Admin() @Patch('SetOrders')` declared **before** the `@Get(':courseId')` (line ~105) and `@Patch(':courseId')` routes, with the same "must stay before :id route" comment as categories.
5. **DTOs** — new `dto/request/course-set-orders.dto.ts` (`CourseOrderDto` + `CourseSetOrdersDto`, same validators); response `CourseDto` + `courseToDto` mapping gets `@Expose() order: number;`.

## Frontend (`client/`)

6. **Types/API**:
   - `features/course/dto/course.dto.ts` — add `order: number`.
   - `course-api.ts` — `CourseSetOrders` mutation → PATCH `Courses/SetOrders`, with the same optimistic `onQueryStarted` update + undo pattern as `CategorySetOrders` (operating on the `{ pageSize: 1000 }` CoursesGetManyAdmin cache entry); export `useCourseSetOrdersMutation`.
7. **Admin courses page rewrite** (`admin-panel-courses.tsx`) — replace the server-paginated DataGrid with the same plain-table + dnd-kit layout as admin-categories:
   - Remove pagination state; fetch all with `useCoursesGetManyAdminQuery({ pageSize: 1000 })`; client-side search filter with existing `useDebounce`.
   - `DndContext` (Pointer/Touch/Keyboard sensors, closestCenter) + `SortableContext` + per-row `useSortable` with GripVertical handle — replicate the `SortableRow` inline component from `admin-panel-categories.tsx`, adapted to course columns (thumbnail/title/lecturer/actions).
   - `handleDragEnd`: `arrayMove` → `mutateCourseSetOrders({ orders: reordered.map((c, i) => ({ id: c.id, order: i + 1 })) })`; error toast + invalidate on failure (optimistic update handled in onQueryStarted).
   - Keep existing row actions (view, publish toggle, set category, favorite, delete) working in the new table.
8. **User-facing sort** — no component changes: `courses.tsx` passes no `sortBy`, so it automatically picks up `order asc` from the new backend default. Home favorites keep their own `FavoriteCourse.order` sort (unchanged).

## Verification
- Migration deploy confirmed; `nest build` + `vite build` clean; no new tsc errors in changed files.
- Live: `GET /api/Courses` returns courses sorted by `order`; unauthenticated `PATCH Courses/SetOrders` → 401.
- Manual: drag rows in `/Admin/Courses` → order persists after reload; `/courses` page shows the new order.