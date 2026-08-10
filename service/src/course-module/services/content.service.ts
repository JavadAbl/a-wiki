import { BadRequestException, Injectable } from '@nestjs/common';
import { ContentRepository } from '../repositories/content.repository';
import { ContentCreateDto } from '../dto/request/content-create.dto';
import { PartRepository } from '../repositories/part.repository';
import { extname } from 'path';
import { createHash } from 'crypto';
import * as mm from 'music-metadata';
import { S3Provider } from 'src/infrastructure-modules/s3-module/s3.provider';
import { random5Digit } from 'src/common/utils/app.utils';
import { ContentUpdateDto } from '../dto/request/content-update.dto';
import { ContentCreateManyDto } from '../dto/request/content-create-many.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRep: ContentRepository,
    private readonly partRep: PartRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async contentCreate(partId: number, payload: ContentCreateDto, file: Express.Multer.File): Promise<number> {
    if (!file) throw new BadRequestException('Wrong file');

    const part = await this.partRep.findAndCheckExistsBy(
      { where: { id: partId }, include: { section: { include: { course: true } } } },
      'partId',
      partId,
    );

    const courseId = part.section.course.id;
    const sectionId = part.section.id;
    const partIdVal = part.id;

    // 1. Check file type
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');
    if (!isVideo && !isAudio) {
      throw new BadRequestException(
        `Invalid file type for "${file.originalname}". Only audio and video files are allowed.`,
      );
    }

    const mediaType = isVideo ? 'Video' : 'Audio';
    const folderType = isVideo ? 'videos' : 'sounds';

    // 2. Build the S3 key
    const ext = extname(file.originalname);
    const fileHash = createHash('md5').update(file.buffer).digest('hex');
    const uniqueFilename = `${random5Digit()}${fileHash}${ext}`;
    const s3Key = [
      'courses',
      String(courseId),
      'sections',
      String(sectionId),
      'parts',
      String(partIdVal),
      folderType,
      uniqueFilename,
    ].join('/');

    // 3. Extract metadata before clearing the buffer
    const metadata = await mm.parseBuffer(file.buffer, { mimeType: file.mimetype });
    const durationSeconds = Math.round(metadata.format.duration || 0);

    // 4. Upload to S3
    await this.s3Provider.Put(s3Key, file.buffer, file.mimetype);

    // 5. Free memory
    file.buffer = null as any;

    // 6. Persist inside a transaction so order assignment is race-safe
    const content = await this.contentRep.prismaClient.$transaction(async (tx) => {
      // Find the current maximum order for this part
      const lastContent = await tx.content.findFirst({
        where: { partId: partIdVal },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const nextOrder = (lastContent?.order ?? -1) + 1;

      return tx.content.create({
        data: {
          durationSeconds,
          mediaUrl: s3Key,
          mediaType: mediaType as any,
          partId: partIdVal,
          order: nextOrder,
          title: payload.title,
          description: payload.description,
        },
      });
    });

    return content.id;
  }

  async contentCreateMany(
    partId: number,
    payload: ContentCreateManyDto,
    files: Express.Multer.File[],
  ): Promise<number[]> {
    if (!files?.length) throw new BadRequestException('No files provided');

    const { titles, descriptions } = payload;
    if (titles.length !== files.length || descriptions.length !== files.length) {
      throw new BadRequestException('titles and descriptions arrays must match the number of files');
    }

    const part = await this.partRep.findAndCheckExistsBy(
      { where: { id: partId }, include: { section: { include: { course: true } } } },
      'partId',
      partId,
    );

    const courseId = part.section.course.id;
    const sectionId = part.section.id;
    const partIdVal = part.id;

    const baseKeySegments = [
      'courses',
      String(courseId),
      'sections',
      String(sectionId),
      'parts',
      String(partIdVal),
    ];

    // 1. Pre-validate & prepare metadata for every file
    type PreparedItem = {
      file: Express.Multer.File;
      title: string;
      description: string;
      mediaType: 'Video' | 'Audio';
      folderType: string;
      s3Key: string;
      durationSeconds: number;
    };

    const prepared: PreparedItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const isVideo = file.mimetype.startsWith('video/');
      const isAudio = file.mimetype.startsWith('audio/');
      if (!isVideo && !isAudio) {
        throw new BadRequestException(
          `Invalid file type for "${file.originalname}". Only audio and video files are allowed.`,
        );
      }

      const mediaType = isVideo ? 'Video' : 'Audio';
      const folderType = isVideo ? 'videos' : 'sounds';

      const ext = extname(file.originalname);
      const fileHash = createHash('md5').update(file.buffer).digest('hex');
      const uniqueFilename = `${random5Digit()}${fileHash}${ext}`;
      const s3Key = [...baseKeySegments, folderType, uniqueFilename].join('/');

      const metadata = await mm.parseBuffer(file.buffer, { mimeType: file.mimetype });
      const durationSeconds = Math.round(metadata.format.duration || 0);

      prepared.push({
        file,
        title: titles[i],
        description: descriptions[i],
        mediaType,
        folderType,
        s3Key,
        durationSeconds,
      });
    }

    // 2. Upload to S3, free memory as we go. Track uploaded keys for rollback on failure.
    const uploadedKeys: string[] = [];
    try {
      for (const item of prepared) {
        await this.s3Provider.Put(item.s3Key, item.file.buffer, item.file.mimetype);
        uploadedKeys.push(item.s3Key);
        item.file.buffer = null as any; // free memory
      }

      // 3. Persist in a single transaction so order assignment is race-safe
      const ids = await this.contentRep.prismaClient.$transaction(async (tx) => {
        const lastContent = await tx.content.findFirst({
          where: { partId: partIdVal },
          orderBy: { order: 'desc' },
          select: { order: true },
        });

        let nextOrder = (lastContent?.order ?? -1) + 1;

        const createdIds: number[] = [];
        for (const item of prepared) {
          const content = await tx.content.create({
            data: {
              durationSeconds: item.durationSeconds,
              mediaUrl: item.s3Key,
              mediaType: item.mediaType,
              partId: partIdVal,
              order: nextOrder++,
              title: item.title,
              description: item.description,
            },
          });
          createdIds.push(content.id);
        }
        return createdIds;
      });

      return ids;
    } catch (err) {
      // Best-effort cleanup: delete already-uploaded objects if transaction failed
      await Promise.allSettled(uploadedKeys.map((key) => this.s3Provider.deleteAllVersions(key)));
      throw err;
    }
  }

  async contentUpdate(contentId: number, payload: ContentUpdateDto): Promise<void> {
    await this.contentRep.findAndCheckExistsBy({ where: { id: contentId } }, 'contentId', contentId);

    await this.contentRep.update({ where: { id: contentId }, data: payload });
  }

  async contentDelete(contentId: number): Promise<void> {
    const content = await this.contentRep.findAndCheckExistsBy(
      { where: { id: contentId } },
      'contentId',
      contentId,
    );

    await this.s3Provider.deleteAllVersions(content.mediaUrl);
    await this.contentRep.remove({ where: { id: contentId } });
  }

  async generatePresignedUrl(contentId: number): Promise<{ url: string }> {
    const content = await this.contentRep.findAndCheckExistsBy(
      { where: { id: contentId } },
      'contentId',
      contentId,
    );
    const url = await this.s3Provider.getSignedUrlByKey(content.mediaUrl);
    return { url };
  }

  private sanitize(str: string): string {
    return str.replace(/\s+/g, '_').replace(/[^\w\-_.]/g, '');
  }
}
