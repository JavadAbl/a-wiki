# Admin-manageable Home Hero Background Image

## Design summary
- **Storage:** new `service/static/images/` directory (exactly as requested), served at URL `/static/images/*` by adding a second `ServeStaticModule` root with `serveRoot: '/static'`. Uploaded file is named `hero.<ext>` (ext = real image extension); the old file is deleted on replace, so exactly one hero image exists.
- **No DB changes, no S3** — a simple disk-based site asset, unlike course/media uploads which use S3. (Per your spec.)
- **Backend:** two endpoints on the existing `AppController` (which already owns `DashboardHeroData`): public `GET /api/HeroImageURL` → `{ url: "/static/images/hero.webp" }` or `{ url: null }` before any upload; admin-only `POST /api/HeroImage` (multipart FormData).
- **Frontend:** RTK Query endpoints in `shared-api.ts`; home hero switches from the hardcoded Tailwind `bg-[url(...)]` class to an inline `style` so the URL can be dynamic (fallback to the bundled `/images/hero.webp`); a new admin **Settings** page (`/Admin/Settings`, sidebar entry "تنظیمات") with a drag-drop upload modal copying the existing `thumbnail-create.tsx` pattern.

## Backend (`service/`)

1. **Static serving — `src/app.module.ts`**
   Change `ServeStaticModule.forRoot({ rootPath: join(process.cwd(), 'client') })` to `ServeStaticModule.forRoot({ rootPath: join(process.cwd(), 'client') }, { rootPath: join(process.cwd(), 'static'), serveRoot: '/static' })`. (forRoot accepts multiple configs; `serveRoot` prevents URL collisions between the two roots.)

2. **New `src/app.service.ts`** — plain injectable class (same style as `CourseService` being injected directly into `CourseController`):
   - `HERO_DIR = join(process.cwd(), 'static', 'images')`.
   - `heroImageGetUrl()` — read dir, find the `hero.*` file, return `{ url: '/static/images/hero.<ext>' }`; `{ url: null }` if missing/ENOENT.
   - `heroImageUpdate(file: Express.Multer.File)` — validate `file.mimetype` against `{ image/jpeg: '.jpg', image/png: '.png', image/webp: '.webp', image/gif: '.gif' }` → `BadRequestException` otherwise; `mkdirSync(HERO_DIR, { recursive: true })`; delete any existing `hero.*`; `writeFileSync(join(HERO_DIR, 'hero' + ext), file.buffer)`.
   - Register as provider in `AppModule`, inject into `AppController`.

3. **`src/app.controller.ts`** — add:
   - `@Public() @Get('/HeroImageURL')` → `appService.heroImageGetUrl()` (public because anonymous visitors see the hero).
   - `@Admin() @Post('/HeroImage') @HttpCode(CREATED)` with `@UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))` → `appService.heroImageUpdate(file)` (5 MB — a full-width background needs more than the 2 MB thumbnail limit). Imports mirror `course.controller.ts` (`@nestjs/platform-express`, `memoryStorage` from `multer`). Auth is automatic via the global guards + `@Admin()`.

4. **`static/images/.gitkeep`** committed; **`.gitignore`** gets `/static/images/*` + `!/static/images/.gitkeep`.

5. **`compose.yml`** — add volume `- ./static:/app/static` to the `app` service so uploads persist and survive rebuilds. Deployment note: the container runs as user `node` and bind mounts take the host directory's ownership — on the Linux prod host, `./static` must be writable by the container's node user (e.g. `chown 1000` or chmod 777 once). No issue in local Windows dev.

## Frontend (`client/`)

6. **`src/features/base-api.ts`** — export `apiOrigin` (derived from `BASE_ADDRESS` by stripping the trailing `api/`) and a small `toAbsoluteAssetUrl(path)` helper; the backend returns a root-relative URL, and in dev the Vite server and API are on different origins (BASE_ADDRESS is hardcoded `http://localhost:3000/api/`).

7. **`src/features/shared/shared-api.ts`** — add `tagTypes: ['HeroImageURL']` and:
   - `HeroImageURL: builder.query<{ url: string | null }, void>` → `GET HeroImageURL`, `providesTags: ['HeroImageURL']` (mirrors the `{ url }` shape of `ContentGetURLById`).
   - `HeroImageUpdate: builder.mutation<void, { body: FormData }>` → `POST HeroImage`, `invalidatesTags: ['HeroImageURL']` (mirrors `ThumbnailCreate`; fetchBaseQuery sends FormData as multipart automatically).

8. **`src/pages/home/components/home-hero.tsx`** — add `useHeroImageUrlQuery()`; compute `heroUrl = toAbsoluteAssetUrl(heroData?.url) ?? '/images/hero.webp'`; move the background to an inline style (identical gradient, dynamic image layer) since Tailwind arbitrary classes can't be built from runtime strings:
   ```tsx
   <section
     className="relative min-h-180 w-full overflow-hidden bg-center bg-cover"
     style={{ backgroundImage: `linear-gradient(270deg, rgba(11,79,74,0.6) 16.81%, rgba(15,23,43,0.9) 73.25%), url('${heroUrl}')` }}
   >
   ```
   Fallback keeps the hero working before the query resolves and when no image was ever uploaded.

9. **Admin Settings page** (new files, following existing page/modal conventions):
   - `src/pages/admin-panel/admin-settings/admin-panel-settings.tsx` — page with a Card "تصویر پس‌زمینه صفحه اصلی": shows the current hero image (from the query, absolute URL) and a "تغییر تصویر" button opening the modal.
   - `src/pages/admin-panel/admin-settings/components/hero-image-update.tsx` — adapted copy of `thumbnail-create.tsx`: Modal, drag-and-drop zone + hidden file input, same `ALLOWED_TYPES`/error messages, 5 MB limit, FormData submit via `useHeroImageUpdateMutation()`, success toast + modal close (invalidation refetches both the admin preview and the public hero).
   - `src/pages/admin-panel/admin-panel-routes.tsx` — add `<Route path="Settings" element={<AdminPanelSettings />} />`.
   - `src/pages/admin-panel/admin-sidebar/admin-sidebar.tsx` — add NavLink `/Admin/Settings` with lucide `Settings` icon and label "تنظیمات".

## Verification
- `npm run build` in `service/` (typecheck) and the client's build/typecheck script.
- Manual flow: log in as admin → `/Admin/Settings` → upload a jpg/png/webp → confirm `service/static/images/hero.<ext>` exists and the old one was deleted → open `/static/images/hero.<ext>` directly → reload home page and see the new background; log out and confirm anonymous visitors still see the hero (public GET). Upload a `.txt`/oversized file and confirm rejection.