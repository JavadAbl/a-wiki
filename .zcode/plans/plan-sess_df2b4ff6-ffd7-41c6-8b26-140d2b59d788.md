## Context

The admin users page (`/Admin/Users`) only allows creating one user at a time through a 4-field modal (نام، نام خانوادگی، کدملی، موبایل). Admins need to onboard many users at once. There is no Excel handling anywhere in the repo today (no `xlsx`/`exceljs`/CSV parsing), so this is greenfield. The nearest precedents are the batch media upload (`ContentCreateMany`) and the commented-out legacy `UserService.insertData()`.

**Decisions confirmed with you:** template uses the same 4 fields as the current form; duplicate/invalid rows are skipped and reported while the rest are still created; the modal shows a result table plus a downloadable Excel of failed rows for re-upload.

**Approach:** Excel is parsed and generated **server-side** with `exceljs` — the client stays dependency-free, validation lives in one place, and the failed-rows file is byte-compatible with the template (re-uploadable).

---

## Backend (`service/`)

### 1. Dependency
- `service/package.json`: add `exceljs` (server-side only).

### 2. New files
- `service/src/user-module/services/user-batch.service.ts` — `UserBatchService`, injected with `UserRepository`, `PasswordService`, `PrismaProvider`.
  - `buildTemplate(): Promise<Buffer>` — `exceljs` workbook, `worksheet.views = [{ rightToLeft: true }]`, sheet `کاربران` with headers `نام | نام خانوادگی | کدملی | موبایل` and `!cols` widths; a second sheet `راهنما` with Persian instructions (default password = کدملی، موبایل اختیاری، سطر عنوان‌ها را تغییر ندهید، حداکثر ۵۰۰ سطر، فقط xlsx).
  - `createFromWorkbook(buffer): Promise<UserBatchResultDto>`:
    - Guards → `BadRequestException` with Persian message: wrong/missing sheet, missing required headers, more than **500** data rows.
    - Header mapping tolerant of variants (`کدملی`/`کد ملی`، `موبایل`/`شماره موبایل`/`شماره تماس`) after trimming spaces/ZWNJ; extra columns (e.g. a `خطا` column from the error file) are ignored.
    - Per row: normalize Persian digits (equivalent of `toEnglishDigits`) + strip non-digits; validate with the same rules as `UserCreateDto` (firstName/lastName non-empty ≤100, nationalCode exactly 10 digits, mobile optional but 11 digits starting with `0`); blank rows skipped; cell read via `cell.value` when numeric, else `cell.text`.
    - Duplicates: one batched `findMany({ where: { nationalCode: { in: codes } } })` for existing DB rows plus an in-file `Map` for repeated codes → distinct messages (`کدملی قبلاً در سیستم ثبت شده است` / `کدملی در فایل تکراری است`).
    - Create: pre-hash valid rows with `p-limit(8)` (already a dependency; bcrypt cost 10), then `prisma.user.createMany({ data })`; if that throws (race), fall back to a per-row `create` loop with `try/catch` so failures stay attributable. `role: Role.User`, `password = hash(nationalCode)` — identical to `UserService.userCreate`.
    - Build `errorFileBase64` from failed rows only: same headers plus a trailing `خطا` column with the reason, so it can be re-uploaded directly.
- `service/src/user-module/dto/response/user-batch-result.dto.ts` — `UserBatchResultDto { totalRows, successCount, failureCount, results: UserBatchRowResultDto[], errorFileBase64?: string }`, `UserBatchRowResultDto { row, firstName, lastName, nationalCode, mobile, status: 'success' | 'failed', message? }`.
- `service/src/user-module/user.module.ts` — register `UserBatchService`.

### 3. Endpoints — `service/src/user-module/controllers/user.controller.ts`
Both decorated with the existing `@Admin()` (`src/common/decorators/admin.decorator.ts`, enforced by `AdminGuard`), scoped to just these two methods so existing routes keep their current behavior:
- `GET Users/Batch/Template` → `@Res()`, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="users-template.xlsx"`, `res.send(buffer)`.
- `POST Users/Batch` → `@UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }))`, `@HttpCode(201)`, rejects non-`.xlsx` and returns `UserBatchResultDto`.

No Prisma schema change or migration.

---

## Frontend (`client/`)

### 4. API layer — `client/src/features/user/user-api.ts`
- `UserBatchTemplate: builder.query<Blob, void>` → `GET Users/Batch/Template`, `responseHandler: (res) => res.blob()`; exported as `useLazyUserBatchTemplateQuery`.
- `UserBatchCreate: builder.mutation<UserBatchResultDto, { body: FormData }>` → `POST Users/Batch`, `invalidatesTags: ["user"]` so the grid refreshes.
- New `client/src/features/user/dto/user-batch-result.dto.ts` mirroring backend types.

### 5. New modal — `client/src/pages/admin-panel/admin-users/components/user-batch-create.tsx`
Three states inside the existing `Modal` (`#components/modals/modal.tsx`), Persian/RTL, matching `user-create.tsx` spacing and buttons:
1. **انتخاب فایل** — dashed drop zone + hidden `<input type="file" accept=".xlsx">` (pattern from `thumbnail-create.tsx`: drag/drop, size/type validation, `fileInputRef.value = ""` reset). `دانلود قالب اکسل` button via `useLazyUserBatchTemplateQuery` → blob → object URL → download `users-template.xlsx` (revoked after use). Submit `بارگذاری و ایجاد` with `isLoading`.
2. **در حال پردازش** — `Spinner` + text.
3. **نتیجه** — summary chips (کل / موفق / ناموفق), then `DataGrid` in `mode="client"` with columns ردیف، نام، نام خانوادگی، کدملی، موبایل، وضعیت (`Badge`), توضیح. If `failureCount > 0`, `دانلود فایل خطاها` decodes `errorFileBase64` → blob → download `users-errors.xlsx`. Buttons `بستن` and `بارگذاری فایل دیگر` (resets to state 1).

### 6. Wire-up — `client/src/pages/admin-panel/admin-users/admin-panel-users.tsx`
Add `isOpenUserBatchCreate` state, render `<UserBatchCreate key={`Batch_${modalKeys}`} … />` with the other modals, and add an outline/secondary button `افزودن گروهی (اکسل)` with a `FileSpreadsheet` icon beside `افزودن کاربر`.

### 7. Small consistency fix
`UserService.userCreate` (line 81) passes `'mobile'` as the duplicate field label while checking `nationalCode`. Change to `'nationalCode'` so single and batch creation report the same message.

---

## Verification (local only — no env.prod)

Use the local SQL Server DB already configured in `service/.env` (`DATABASE_URL=sqlserver://localhost:1433;database=wiki;...`, `NODE_ENV=development`, port 3000). `ConfigModule` + `dotenv` read `service/.env` automatically; nothing points at a production env.

1. `cd service && npm install exceljs && npm run build && npm run lint`
2. `cd client && npm run build && npm run lint`
3. Start locally: `cd service && npm run dev` (loads `service/.env`), then `cd client && npm run dev` (Vite proxies `/api`).
4. Log in as admin → `/Admin/Users` → **افزودن گروهی (اکسل)** → **دانلود قالب اکسل**; verify the file opens in Excel, is RTL, and the help sheet is readable.
5. Prepare rows against the local DB: 2 valid, 1 with a کدملی that already exists locally, 1 repeated کدملی within the file, 1 with 9-digit کدملی, 1 with bad mobile, 1 blank row → upload.
6. Expect exactly 2 successes; the users grid refreshes to show them; the result table lists the rest with correct Persian reasons and correct row numbers.
7. **دانلود فایل خطاها** → fix one row → re-upload that file → only the fixed row is created (extra `خطا` column ignored).
8. Regression against the local DB: normal `افزودن کاربر`, edit, and change-status still work; a `User` role account gets 403 on `POST /api/Users/Batch`.
9. Clean up the test users created in the local DB afterwards (delete via SQL/Prisma studio if you want the local data left as found).
