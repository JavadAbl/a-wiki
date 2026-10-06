# Category Order Feature (drag & drop)

## Design (confirmed with user)
- Add `order Int @default(0)` to the Category model; all category lists (home page, courses filter, admin) sort by it.
- Admin sets order via **drag-and-drop rows in the admin categories table** — and per your instruction, **pagination is removed** from that table so all rows are visible/reorderable in one list. The create/edit modals get **no** order field; reordering happens only via drag.

## Backend (`service/`)

1. **`prisma/schema.prisma`** — add `order Int @default(0)` to Category (after `icon`).

2. **Migration** — established prod-safe workflow: `migrate dev --create-only` can't run (no shadow-DB permission on prod), so generate SQL via read-only `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` (with DATABASE_URL set in the shell), write as migration folder `2026xxxx_category_add_order` with:
   ```sql
   ALTER TABLE [dbo].[Category] ADD [order] INT NOT NULL CONSTRAINT [Category_order_df] DEFAULT 0;
   ```
   in the existing `BEGIN TRY/BEGIN TRAN/.../THROW` style, then `npx prisma migrate deploy` + `npx prisma generate`.

3. **`category.service.ts`**:
   - `categoryGetMany` — default sort `orderBy: [{ order: 'asc' }, { id: 'asc' }]` (same pattern as favorites). Explicit `sortBy` from the query still wins when provided (existing `buildFindManyArgs` behavior preserved).
   - New `categorySetOrders(orders: { id: number; order: number }[])` — validates all listed categories exist, then persists each order in one `prisma.$transaction` of `update` ops. (Skipping self-heal/backfill: all existing rows get `0` from the migration default; equal orders fall back to `id` ordering, which is stable.)
4. **`category.controller.ts`** — `@Patch('SetOrders')` with `@Admin()` guard (Category's other mutations lack `@Admin()` — a bug — but the new route gets it properly) and `CategorySetOrdersDto` **declared before the existing `@Patch(':categoryId')`** route so `SetOrders` isn't captured as an id.
5. **DTOs** — new `dto/request/category-set-orders.dto.ts`:
   ```ts
   export class CategoryOrderDto { @IsInt() id: number; @IsInt() @Min(0) order: number; }
   export class CategorySetOrdersDto { @IsArray() @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => CategoryOrderDto) orders: CategoryOrderDto[]; }
   ```
   Response `CategoryDto` gets `@Expose() order: number;`. Create/update request DTOs stay unchanged (order is managed exclusively by drag-reorder).

## Frontend (`client/`)

6. **Types/API**:
   - `features/course/dto/category.dto.ts` — add `order: number`.
   - `course-api.ts` — new mutation `CategorySetOrders: mutation<void, { orders: { id: number; order: number }[] }>` → `PATCH Categories/SetOrders`, `invalidatesTags: ["category"]`; export `useCategorySetOrdersMutation`.

7. **Admin categories page** (`admin-panel-categories.tsx`) — the main change:
   - **Remove server pagination**: drop `page`/`pageSize` state and the server-mode pagination props; fetch all categories with `useCategoryGetManyQuery({ pageSize: 1000 })` and switch DataGrid to **client mode** (`mode="client"` with `initialPageSize` hiding the pager if supported — otherwise plain list) so all rows are on one scrollable surface. Keep the search box filtering client-side.
   - **Drag-and-drop reorder** with `@dnd-kit/core` + `@dnd-kit/sortable` (if already in package.json — else `npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`): wrap the table body in `SortableContext` using the DataGrid's row list, each row a `useSortable` handle, `DndContext` + `closestCenter` + `KeyboardSensor` for a11y; on drag end compute the new order array and optimistic-update the RTK Query cache (`dispatch(courseApi.util.updateQueryData('CategoryGetMany', args, ...)` pattern) then PATCH `SetOrders`; toast on failure + refetch.
   - Rows show a drag handle (GripVertical icon), consistent with RTL layout.

8. **User-facing sort** — no component changes needed: `home-categories.tsx`, `courses.tsx` filter, and admin pickers all consume `CategoryGetMany`, which now returns categories sorted by `order` from the backend default.

## Verification
- Migration: diff SQL reviewed (single `ALTER TABLE ... ADD [order] ... DEFAULT 0`), `migrate deploy` confirms application, `prisma generate` refreshes types.
- `nest build` + client `vite build` clean; no new tsc errors in changed files.
- Live: `GET /api/Categories` returns categories ordered by `order`; unauthenticated `PATCH Categories/SetOrders` → 401; authenticated drag-reorder persists after reload.
- Manual: drag rows in `/Admin/Categories` → order saves and persists; home page categories render in the new order.