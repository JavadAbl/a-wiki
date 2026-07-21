import { BadRequestException, Injectable } from '@nestjs/common';
import { ThumbnailRepository } from '../repositories/thumbnail.repository';
import { CourseRepository } from '../repositories/course.repository';
import { S3Provider } from 'src/infrastructure-modules/s3-module/s3.provider';
import { extname } from 'path';
import { createHash } from 'crypto';
import { random5Digit } from 'src/common/utils/app.utils';

@Injectable()
export class ThumbnailService {
  constructor(
    private readonly thumbnailRep: ThumbnailRepository,
    private readonly courseRep: CourseRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async thumbnailCreate(courseId: number, file: Express.Multer.File): Promise<number> {
    if (!file) throw new BadRequestException('Wrong file');

    const course = await this.courseRep.findAndCheckExistsBy(
      { where: { id: courseId } },
      'courseId',
      courseId,
    );

    const fileSizeInKb = Math.round(file.size / 1024);

    // 2. Build the S3 key
    const ext = extname(file.originalname);
    const fileHash = createHash('md5').update(file.buffer).digest('hex');
    const uniqueFilename = `${random5Digit()}${fileHash}${ext}`;
    const s3Key = ['courses', String(courseId), 'thumbnails', uniqueFilename].join('/');

    // 4. Upload to S3
    await this.s3Provider.Put(s3Key, file.buffer, file.mimetype);

    // 5. Free memory
    file.buffer = null as any;

    // 6. Persist inside a transaction so order assignment is race-safe
    const thumbnail = await this.thumbnailRep.create({
      data: { fileUrl: s3Key, courseId: course.id, fileSize: fileSizeInKb },
    });

    return thumbnail.id;
  }

  async thumbnailDelete(courseId: number): Promise<void> {
    const thumbnails = await this.thumbnailRep.findMany({ where: { courseId } });

    for (const thumbnail of thumbnails.items) {
      await this.s3Provider.delete(thumbnail.fileUrl);
      await this.thumbnailRep.remove({ where: { id: thumbnail.id } });
    }
  }
}
