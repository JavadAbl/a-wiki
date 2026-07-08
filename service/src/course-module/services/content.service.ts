import { BadRequestException, Injectable } from '@nestjs/common';
import { ContentRepository } from '../repositories/content.repository';
import { ContentCreateDto } from '../dto/request/content-create.dto';
import { PartRepository } from '../repositories/part.repository';
import { extname, join, relative } from 'path';
import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { MediaType } from 'src/generated/prisma/enums';
import * as mm from 'music-metadata';

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRep: ContentRepository,
    private readonly partRep: PartRepository,
  ) {}

  async contentCreate(partId: number, payload: ContentCreateDto, file: Express.Multer.File): Promise<number> {
    const part = await this.partRep.findAndCheckExistsBy(
      { where: { id: partId }, include: { section: { include: { course: true } } } },
      'sectionId',
      partId,
    );

    const courseId = part.section.course.id;

    const sectionId = part.section.id;

    const partIdVal = part.id;

    const baseDir = join(process.cwd(), 'files');

    // 2. Check file type (Video or Audio)
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');

    if (!isVideo && !isAudio) {
      throw new BadRequestException(
        `Invalid file type for "${file.originalname}". Only audio and video files are allowed.`,
      );
    }

    const mediaType: MediaType = isVideo ? 'Video' : 'Audio';
    const folderType = isVideo ? 'videos' : 'sounds';

    // 3. Build the directory path
    const dirPath = join(
      baseDir,
      'courses',
      `${courseId}`,
      'sections',
      `${sectionId}`,
      'parts',
      `${partIdVal}`,
      folderType,
    );

    await mkdir(dirPath, { recursive: true });

    // 4. Generate unique filename and save to disk
    const ext = extname(file.originalname);
    const fileHash = createHash('md5').update(file.buffer).digest('hex');
    const uniqueFilename = `${fileHash}${ext}`;
    const absoluteFilePath = join(dirPath, uniqueFilename);

    await writeFile(absoluteFilePath, file.buffer);

    const metadata = await mm.parseBuffer(file.buffer, { mimeType: file.mimetype });
    const durationSeconds = Math.round(metadata.format.duration || 0);

    // 5. Remove from memory (Garbage collection will clear it)
    file.buffer = null as any;

    // 6. Prepare data for Prisma
    // Note: We save a relative web-friendly URL instead of an absolute local system path
    const relativeUrl = '/' + relative(process.cwd(), absoluteFilePath).replace(/\\/g, '/');

    // 7. Save all records to the database in a single query
    const content = await this.contentRep.create({
      data: {
        durationSeconds,
        mediaUrl: relativeUrl,
        mediaType: mediaType as any,
        partId: partIdVal,
        title: payload.title,
        contentOrder: payload.contentOrder,
        description: payload.description,
      },
    });

    return content.id;
  }

  private sanitize(str: string): string {
    return str.replace(/\s+/g, '_').replace(/[^\w\-_.]/g, '');
  }
}
