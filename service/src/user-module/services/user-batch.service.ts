import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook, type Row, type Worksheet } from 'exceljs';
import pLimit from 'p-limit';
import { Role } from 'src/auth-module/enums/role.enum';
import { PasswordService } from 'src/auth-module/services/password.service';
import { UserRepository } from '../repository/user.repository';
import { UserBatchResultDto, UserBatchRowResultDto } from '../dto/response/user-batch-result.dto';

const SHEET_NAME = 'کاربران';
const MAX_ROWS = 500;
const MAX_FIRST_NAME_LENGTH = 100;
const MAX_LAST_NAME_LENGTH = 100;

type ColumnKey = 'firstName' | 'lastName' | 'nationalCode' | 'mobile';

const COLUMNS: Record<ColumnKey, string[]> = {
  firstName: ['نام', 'نام کوچک'],
  lastName: ['نام خانوادگی', 'نامخانوادگی'],
  nationalCode: ['کدملی', 'کد ملی', 'کد ملی '],
  mobile: ['موبایل', 'شماره موبایل', 'شماره تماس', 'تلفن همراه'],
};

const COLUMN_KEYS: ColumnKey[] = ['firstName', 'lastName', 'nationalCode', 'mobile'];

const HEADERS_FA: Record<ColumnKey, string> = {
  firstName: 'نام',
  lastName: 'نام خانوادگی',
  nationalCode: 'کدملی',
  mobile: 'موبایل',
};

interface ParsedRow extends UserBatchRowResultDto {
  nationalCode: string;
}

/**
 * Normalizes digits (Persian/Arabic), spaces and ZWNJ so header names and cell
 * values coming from different Excel versions can still be matched.
 */
function normalizeText(value: string): string {
  return value
    .replace(/[\u06F0-\u06F9]/g, (char) => String(char.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (char) => String(char.charCodeAt(0) - 0x0660))
    .replace(/\u064A/g, 'ی')
    .replace(/\u0643/g, 'ک')
    .replace(/[\s\u200c\u200f\u200e]/g, '')
    .trim();
}

function digitsOnly(value: string): string {
  return normalizeText(value).replace(/\D/g, '');
}

function cellText(row: Row, columnNumber: number): string {
  const cell = row.getCell(columnNumber);
  const value = cell.value;

  if (value === null || value === undefined) return '';

  if (typeof value === 'number') return String(Math.trunc(value));

  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text.trim();
    if ('richText' in value && Array.isArray(value.richText))
      return value.richText
        .map((part: { text: string }) => part.text)
        .join('')
        .trim();
    if ('result' in value && value.result !== undefined && value.result !== null)
      return typeof value.result === 'object' ? cell.text.trim() : String(value.result);
    if ('hyperlink' in value && typeof value.hyperlink === 'string') return cell.text.trim();
  }

  return cell.text.trim();
}

@Injectable()
export class UserBatchService {
  constructor(
    private readonly userRep: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async buildTemplate(): Promise<Buffer> {
    const workbook = new Workbook();
    workbook.creator = 'wiki';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(SHEET_NAME, { views: [{ rightToLeft: true }] });

    sheet.columns = [
      { header: HEADERS_FA.firstName, key: 'firstName', width: 22 },
      { header: HEADERS_FA.lastName, key: 'lastName', width: 26 },
      { header: HEADERS_FA.nationalCode, key: 'nationalCode', width: 18 },
      { header: HEADERS_FA.mobile, key: 'mobile', width: 18 },
    ];

    this.styleHeader(sheet.getRow(1));
    this.forceTextColumns(sheet, [3, 4]);

    const help = workbook.addWorksheet('راهنما', { views: [{ rightToLeft: true }] });
    help.columns = [{ width: 100 }];
    const instructions = [
      'راهنمای ایجاد گروهی کاربران',
      '',
      `۱. اطلاعات کاربران را در شیت «${SHEET_NAME}» و زیر سطر عنوان‌ها وارد کنید.`,
      '۲. سطر اول (عنوان‌ها) را تغییر ندهید، حذف نکنید و جابه‌جا نکنید.',
      '۳. ستون‌های نام، نام خانوادگی و کدملی الزامی هستند. موبایل اختیاری است.',
      `۴. کدملی باید دقیقاً ۱۰ رقم و موبایل ۱۱ رقم و با صفر شروع شود.`,
      '۵. ستون‌های کدملی و موبایل از قبل به قالب «متن» (Text) تنظیم شده‌اند تا صفر ابتدای شماره حذف نشود؛ این قالب را تغییر ندهید.',
      '۶. رمز عبور هر کاربر به‌صورت پیش‌فرض همان کدملی او خواهد بود.',
      '۷. کدملی‌های تکراری (در فایل یا در سیستم) ایجاد نمی‌شوند و در فایل خطاها گزارش می‌شوند.',
      `۸. حداکثر ${MAX_ROWS} کاربر در هر بار بارگذاری امکان‌پذیر است.`,
      '۹. سطرهای خالی نادیده گرفته می‌شوند.',
      '۱۰. فقط فایل با پسوند xlsx پذیرفته می‌شود.',
    ];
    instructions.forEach((text, index) => {
      const row = help.getRow(index + 1);
      row.getCell(1).value = text;
      if (index === 0) row.getCell(1).font = { bold: true, size: 13 };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async createFromWorkbook(buffer: Buffer): Promise<UserBatchResultDto> {
    const workbook = new Workbook();
    try {
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch {
      throw new BadRequestException('فایل اکسل قابل خواندن نیست. لطفاً از قالب ارائه‌شده استفاده کنید.');
    }

    const sheet = workbook.getWorksheet(SHEET_NAME) ?? workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('فایل اکسل هیچ شیتی ندارد.');

    const headerRow = sheet.getRow(1);
    const columnMap = this.mapColumns(headerRow);

    const parsedRows: ParsedRow[] = [];
    const seenCodes = new Map<string, number>();

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const raw: Record<ColumnKey, string> = {
        firstName: columnMap.firstName ? cellText(row, columnMap.firstName) : '',
        lastName: columnMap.lastName ? cellText(row, columnMap.lastName) : '',
        nationalCode: columnMap.nationalCode ? cellText(row, columnMap.nationalCode) : '',
        mobile: columnMap.mobile ? cellText(row, columnMap.mobile) : '',
      };

      // Skip fully empty rows.
      if (!raw.firstName && !raw.lastName && !raw.nationalCode && !raw.mobile) return;

      if (parsedRows.length >= MAX_ROWS)
        throw new BadRequestException(`حداکثر ${MAX_ROWS} سطر در هر بار بارگذاری مجاز است.`);

      const firstName = raw.firstName.trim();
      const lastName = raw.lastName.trim();
      const nationalCode = digitsOnly(raw.nationalCode);
      const mobile = this.normalizeMobile(digitsOnly(raw.mobile));

      const base: ParsedRow = {
        row: rowNumber,
        firstName,
        lastName,
        nationalCode,
        mobile: mobile || null,
        status: 'success',
      };

      const error = this.validateRow(firstName, lastName, nationalCode, mobile);
      if (error) {
        parsedRows.push({ ...base, status: 'failed', message: error });
        return;
      }

      const duplicateRow = seenCodes.get(nationalCode);
      if (duplicateRow !== undefined) {
        parsedRows.push({
          ...base,
          status: 'failed',
          message: `کدملی در فایل تکراری است (سطر ${duplicateRow})`,
        });
        return;
      }
      seenCodes.set(nationalCode, rowNumber);

      parsedRows.push(base);
    });

    if (parsedRows.length === 0) throw new BadRequestException('فایل اکسل هیچ سطر معتبری ندارد.');

    const candidateCodes = parsedRows
      .filter((row) => row.status === 'success')
      .map((row) => row.nationalCode);

    if (candidateCodes.length > 0) {
      const existing = await this.userRep.prismaClient.user.findMany({
        where: { nationalCode: { in: candidateCodes } },
        select: { nationalCode: true },
      });
      const existingCodes = new Set(existing.map((user) => user.nationalCode));

      for (const row of parsedRows) {
        if (row.status === 'success' && existingCodes.has(row.nationalCode)) {
          row.status = 'failed';
          row.message = 'کدملی قبلاً در سیستم ثبت شده است';
        }
      }
    }

    await this.createUsers(parsedRows);

    const successCount = parsedRows.filter((row) => row.status === 'success').length;
    const failedRows = parsedRows.filter((row) => row.status === 'failed');

    return {
      totalRows: parsedRows.length,
      successCount,
      failureCount: failedRows.length,
      results: parsedRows.map(({ nationalCode, ...rest }) => ({ ...rest, nationalCode })),
      errorFileBase64: failedRows.length > 0 ? await this.buildErrorFile(failedRows) : undefined,
    };
  }

  private mapColumns(headerRow: Row): Partial<Record<ColumnKey, number>> {
    const map: Partial<Record<ColumnKey, number>> = {};

    headerRow.eachCell((cell, columnNumber) => {
      const title = normalizeText(cellText(headerRow, columnNumber));
      if (!title) return;

      for (const key of COLUMN_KEYS) {
        if (map[key] !== undefined) continue;
        if (COLUMNS[key].some((alias) => normalizeText(alias) === title)) {
          map[key] = columnNumber;
          return;
        }
      }
    });

    const missing = (['firstName', 'lastName', 'nationalCode'] as ColumnKey[]).filter(
      (key) => map[key] === undefined,
    );

    if (missing.length > 0)
      throw new BadRequestException(
        `ستون‌های ${missing.map((key) => `«${HEADERS_FA[key]}»`).join(' و ')} در فایل اکسل پیدا نشد.`,
      );

    return map;
  }

  private normalizeMobile(mobile: string): string {
    // Excel drops the leading zero when the cell is numeric (9121111111 -> 09121111111).
    if (mobile.length === 10 && mobile.startsWith('9')) return `0${mobile}`;
    return mobile;
  }

  private validateRow(
    firstName: string,
    lastName: string,
    nationalCode: string,
    mobile: string,
  ): string | null {
    if (!firstName) return 'نام الزامی است';
    if (firstName.length > MAX_FIRST_NAME_LENGTH)
      return `نام حداکثر ${MAX_FIRST_NAME_LENGTH} کاراکتر می‌باشد`;
    if (!lastName) return 'نام خانوادگی الزامی است';
    if (lastName.length > MAX_LAST_NAME_LENGTH)
      return `نام خانوادگی حداکثر ${MAX_LAST_NAME_LENGTH} کاراکتر می‌باشد`;
    if (nationalCode.length !== 10) return 'کدملی باید دقیقاً ۱۰ رقم باشد';
    if (mobile && !/^0\d{10}$/.test(mobile)) return 'شماره موبایل باید ۱۱ رقم و با صفر شروع شود';
    return null;
  }

  private async createUsers(rows: ParsedRow[]): Promise<void> {
    const validRows = rows.filter((row) => row.status === 'success');
    if (validRows.length === 0) return;

    const limit = pLimit(8);
    const created = await Promise.all(
      validRows.map((row) =>
        limit(async () => ({ row, password: await this.passwordService.hashPassword(row.nationalCode) })),
      ),
    );

    try {
      await this.userRep.prismaClient.user.createMany({
        data: created.map(({ row, password }) => ({
          firstName: row.firstName,
          lastName: row.lastName,
          nationalCode: row.nationalCode,
          mobile: row.mobile,
          password,
          role: Role.User,
        })),
      });
    } catch (error) {
      // createMany is all-or-nothing; retry row by row so one conflict does not
      // discard every other valid row and each failure stays attributable.
      console.error('Batch user createMany failed, falling back to per-row create', error);

      for (const { row, password } of created) {
        try {
          await this.userRep.create({
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              nationalCode: row.nationalCode,
              mobile: row.mobile,
              password,
              role: Role.User,
            },
          });
        } catch {
          row.status = 'failed';
          row.message = 'خطا در ذخیره‌سازی کاربر';
        }
      }
    }
  }

  private async buildErrorFile(failedRows: ParsedRow[]): Promise<string> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(SHEET_NAME, { views: [{ rightToLeft: true }] });

    sheet.columns = [
      { header: HEADERS_FA.firstName, key: 'firstName', width: 22 },
      { header: HEADERS_FA.lastName, key: 'lastName', width: 26 },
      { header: HEADERS_FA.nationalCode, key: 'nationalCode', width: 18 },
      { header: HEADERS_FA.mobile, key: 'mobile', width: 18 },
      { header: 'خطا', key: 'message', width: 50 },
    ];
    this.styleHeader(sheet.getRow(1));
    this.forceTextColumns(sheet, [3, 4]);

    for (const row of failedRows) {
      sheet.addRow({
        firstName: row.firstName,
        lastName: row.lastName,
        nationalCode: row.nationalCode,
        mobile: row.mobile ?? '',
        message: row.message ?? '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer).toString('base64');
  }

  /**
   * Formats whole columns as Text ("@") so Excel keeps leading zeros typed by the
   * user instead of coercing 0912... into the number 912... .
   */
  private forceTextColumns(sheet: Worksheet, columnNumbers: number[]): void {
    for (const columnNumber of columnNumbers) sheet.getColumn(columnNumber).numFmt = '@';
  }

  private styleHeader(row: Row): void {
    row.font = { bold: true };
    row.height = 22;
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF1F5' } };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFD0D5DD' } } };
    });
  }
}
