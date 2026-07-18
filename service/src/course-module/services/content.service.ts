import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from '../repositories/content.repository';
import { ContentCreateDto } from '../dto/request/content-create.dto';
import { PartRepository } from '../repositories/part.repository';
import { extname } from 'path';
import { createHash } from 'crypto';
import { MediaType } from 'src/generated/prisma/enums';
import * as mm from 'music-metadata';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/common/config/config.type';

@Injectable()
export class ContentService {
  private readonly s3Client: S3Client;
  private readonly s3Bucket = 'javadabl-test';

  constructor(
    private readonly contentRep: ContentRepository,
    private readonly partRep: PartRepository,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    const accessKeyId = this.configService.get('S3_accessKeyId');
    const secretAccessKey = this.configService.get('S3_secretAccessKey');
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: 'https://s3.filebase.io',
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async contentCreate(partId: number, payload: ContentCreateDto, file: Express.Multer.File): Promise<number> {
    if (!file) throw new BadRequestException('Wrong file');

    const part = await this.partRep.findAndCheckExistsBy(
      { where: { id: partId }, include: { section: { include: { course: true } } } },
      'sectionId',
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

    const mediaType: MediaType = isVideo ? 'Video' : 'Audio';
    const folderType = isVideo ? 'videos' : 'sounds';

    // 2. Build the S3 key (mirrors the old directory structure)
    const ext = extname(file.originalname);
    const fileHash = createHash('md5').update(file.buffer).digest('hex');
    const uniqueFilename = `${fileHash}${ext}`;
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
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ContentMD5 optional; Filebase supports standard PUT
      }),
    );

    // 5. Free memory
    file.buffer = null as any;

    // 6. Persist the S3 key (NOT a local path) in mediaUrl
    const content = await this.contentRep.create({
      data: {
        durationSeconds,
        mediaUrl: s3Key, // store the key only
        mediaType: mediaType as any,
        partId: partIdVal,
        title: payload.title,
        description: payload.description,
      },
    });

    return content.id;
  }

  /**
   * Returns a short-lived presigned URL for streaming/downloading the media.
   * Replace the old "absolute path" use-case with this.
   */
  async contentGetPresignedUrl(contentId: number, expiresIn = 3600): Promise<string> {
    const content = await this.contentRep.findAndCheckExistsBy(
      {
        where: { id: contentId },
        include: { part: { include: { section: { include: { course: true } } } } },
      },
      'contentId',
      contentId,
    );

    const key = content.mediaUrl;
    this.assertKeySafe(key);

    // Verify the object actually exists in the bucket
    try {
      await this.s3Client.send(new HeadObjectCommand({ Bucket: this.s3Bucket, Key: key }));
    } catch {
      throw new NotFoundException('Media file not found in object storage');
    }

    return getSignedUrl(this.s3Client, new GetObjectCommand({ Bucket: this.s3Bucket, Key: key }), {
      expiresIn,
    });
  }

  async generatePresignedUrl(contentId: number, expiresIn = 3600): Promise<{ url: string }> {
    const content = await this.contentRep.findAndCheckExistsBy(
      { where: { id: contentId } },
      'contentId',
      contentId,
    );

    try {
      const bucketName = this.s3Bucket;
      const command = new GetObjectCommand({ Bucket: bucketName, Key: content.mediaUrl });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return { url };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  }

  /**
   * If your existing controllers rely on a local absolute path (e.g. res.sendFile),
   * you can keep the method name but stream from S3 to a temp file instead.
   */
  contentFindAbsolutePath(contentId: number): Promise<string> {
    // Option A: throw, and refactor consumers to use presigned URL.
    // Option B: download to os.tmpdir() and return the temp path.
    throw new ForbiddenException(
      'Local file paths are no longer supported. Use contentGetPresignedUrl instead.',
    );
  }

  /** Guard against keys that look like paths trying to escape the bucket namespace. */
  private assertKeySafe(key: string): void {
    if (!key || key.startsWith('/') || key.includes('..') || key.includes('\\')) {
      throw new ForbiddenException('Invalid media key.');
    }
    if (!key.startsWith('courses/')) {
      throw new ForbiddenException('Invalid media key.');
    }
  }

  private sanitize(str: string): string {
    return str.replace(/\s+/g, '_').replace(/[^\w\-_.]/g, '');
  }
}
