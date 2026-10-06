# Related Links (لینک‌های مرتبط) Feature

## Design (confirmed with user)
- **New `Link` entity**: `id`, `title` (optional), `url` (required), `description` (optional), `order` (display order), timestamps.
- **Public** `GET /api/Links` for the navbar modal; **admin-only** create/update/delete (with `@Admin()`, unlike Category which lacks it).
- **Navbar**: new item "لینک‌های مرتبط" placed between "دوره‌های آموزشی" and "درباره ما" — a button styled like `NavbarLink` that opens a modal listing the links.
- **Admin**: new "لینک‌ها" page at `/Admin/Links` (sidebar entry) with a table + create/edit/delete modals, following the categories page layout.

## Backend (`service/`)

1. **`prisma/schema.prisma`** — add model:
   ```prisma
   model Link {
     id          Int      @id() @default(autoincrement())
     title       String?
     url         String
     description String?
     order       Int      @default(0)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Migration** — same prod-safe workflow as the previous two: `migrate diff --from-config-datasource --to-schema --script` (read-only against prod; `migrate dev` can't run — no shadow-DB permission), write migration folder `2026xxxx_add_links` in the `BEGIN TRY/BEGIN TRAN` style, then `npx prisma migrate deploy` + `npx prisma generate`.

3. **New `link-module/`** (self-contained like the course-module's category set — plain service, no contract pattern):
   - `repositories/link.repository.ts` — `extends Repository<'link'>`.
   - `services/link.service.ts` — `linkGetMany()` (ordered by `order`, then id), `linkCreate`, `linkUpdate`, `linkDelete` — following `CategoryService` exactly.
   - `controllers/link.controller.ts` — `@Controller('Links')`:
     - `@Public() @Get()` → `GetManyReply<LinkDto>`
     - `@Admin() @Post()` → 201, id
     - `@Admin() @Patch(':linkId')` → void
     - `@Admin() @Delete(':linkId')` → 204
   - `dto/request/link-create.dto.ts` — `@IsString() @IsUrl() url` (requires protocol; frontend sends `https://...`), `@IsString() @IsOptional() @MaxLength(100) title`, `@IsString() @IsOptional() @MaxLength(1000) description`, `@IsInt() @IsOptional() order`.
   - `dto/request/link-update.dto.ts` — same fields all `@IsOptional()`.
   - `dto/response/link.dto.ts` — `@Exclude()` + `@Expose()` id/title/url/description/order.
   - `link.module.ts` — registers controller/service/repository, plain module added to `AppModule` imports.

## Frontend (`client/`)

4. **New `features/link/`**:
   - `dto/link.dto.ts` — `LinkDto { id, title?, url, description?, order }`.
   - `link-api.ts` — `createApi({ reducerPath: "linkApi", tagTypes: ["link"] })` with `LinksGetMany` (query `Links`, providesTags), `LinkCreate`, `LinkUpdate`, `LinkDelete` (all invalidating `["link"]`), modeled on the category endpoints in `course-api.ts`. Register reducer + middleware in `features/store.ts`.

5. **Navbar modal**:
   - New `components/navbar/navbar-related-links.tsx` — `Modal` (title "لینک‌های مرتبط") listing links: each row shows the optional title (falls back to the URL) as an `<a href target="_blank" rel="noopener noreferrer">` with the description underneath, styled after the documents list card. Empty state "لینکی ثبت نشده است".
   - In `navbar.tsx`: local `isOpenRelatedLinks` state (same pattern as `NavbarResetPassword`); insert a button between "دوره‌های آموزشی" and "درباره ما" — not part of the `links` array (those are `<Link>`s), a separate `<button>` using `NavbarLink`'s classes that calls `setIsOpenRelatedLinks(true)`.

6. **Admin page `pages/admin-panel/admin-links/`**:
   - `admin-panel-links.tsx` — DataGrid (client-side is fine given small counts, but follow the users page server pattern: `page`/`pageSize`/`search` via `useLinksGetManyQuery`) with columns: عنوان/آدرس (title + truncated url), توضیحات, actions dropdown (ویرایش/حذف via `ConfirmModal`).
   - `components/link-create.tsx` and `components/link-update.tsx` — `Modal` + react-hook-form + zod (`features/link/schemas/link-create-schema.ts`: `url: z.string().url("آدرس معتبر وارد کنید")`, optional title/description) with `Field`/`FieldLabel`/`InputMessage`, following `category-create.tsx` conventions; update modal prefilled from the selected link.
   - Wire into `admin-panel-routes.tsx` (`<Route path="Links" ...>`) and `admin-sidebar.tsx` (`/Admin/Links` with `Link2` lucide icon, label "لینک‌ها" — placed after دسته بندی ها).

## Verification
- Migration SQL reviewed; `migrate deploy` confirms application; `prisma generate` refreshes client.
- `nest build` + `vite build` clean; no new tsc errors in changed files.
- Live: `GET /api/Links` → 200 `[]` public; unauthenticated `POST /api/Links` → 401; startup log shows mapped routes.
- Manual: admin adds a link at `/Admin/Links` → navbar modal shows it; clicking opens the URL in a new tab; edit/delete reflect after tag invalidation.