import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';

const HERO_DIR = join(process.cwd(), 'static', 'images');
const HERO_FILE_BASENAME = 'hero';
const HERO_URL_PREFIX = '/static/images';

const ALLOWED_IMAGE_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Injectable()
export class AppService {
  heroImageGetUrl(): { url: string | null } {
    let files: string[];
    try {
      files = readdirSync(HERO_DIR);
    } catch {
      return { url: null };
    }

    const heroFile = files.find(
      (name) =>
        name.startsWith(`${HERO_FILE_BASENAME}.`) &&
        Object.values(ALLOWED_IMAGE_MIME_TYPES).some((ext) => ext === name.slice(HERO_FILE_BASENAME.length)),
    );

    return { url: heroFile ? `${HERO_URL_PREFIX}/${heroFile}` : null };
  }

  heroImageUpdate(file: Express.Multer.File): void {
    const ext = ALLOWED_IMAGE_MIME_TYPES[file?.mimetype];
    if (!ext) {
      throw new BadRequestException('فقط فایل‌های تصویری (JPG, PNG, WebP, GIF) مجاز هستند');
    }

    mkdirSync(HERO_DIR, { recursive: true });
    this.deleteExistingHeroFiles();
    writeFileSync(join(HERO_DIR, `${HERO_FILE_BASENAME}${ext}`), file.buffer);
  }

  heroImageDelete(): void {
    this.deleteExistingHeroFiles();
  }

  private deleteExistingHeroFiles(): void {
    let files: string[];
    try {
      files = readdirSync(HERO_DIR);
    } catch {
      return;
    }

    for (const name of files) {
      if (name.startsWith(`${HERO_FILE_BASENAME}.`)) {
        rmSync(join(HERO_DIR, name), { force: true });
      }
    }
  }
}