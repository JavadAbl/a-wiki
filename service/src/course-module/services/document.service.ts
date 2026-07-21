import { BadRequestException, Injectable } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentCreateDto } from '../dto/request/document-create.dto';
import { CourseRepository } from '../repositories/course.repository';
import { S3Provider } from 'src/infrastructure-modules/s3-module/s3.provider';
import { extname } from 'path';
import { createHash } from 'crypto';
import { random5Digit } from 'src/common/utils/app.utils';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRep: DocumentRepository,
    private readonly courseRep: CourseRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async documentCreate(
    courseId: number,
    payload: DocumentCreateDto,
    file: Express.Multer.File,
  ): Promise<number> {
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
    const s3Key = ['courses', String(courseId), 'docs', uniqueFilename].join('/');

    // 4. Upload to S3
    await this.s3Provider.Put(s3Key, file.buffer, file.mimetype);

    // 5. Free memory
    file.buffer = null as any;

    // 6. Persist inside a transaction so order assignment is race-safe
    const document = await this.documentRep.create({
      data: {
        fileUrl: s3Key,
        title: payload.title,
        description: payload.description,
        courseId: course.id,
        fileSize: fileSizeInKb,
      },
    });

    return document.id;
  }

  async documentDelete(documentId: number): Promise<void> {
    const document = await this.documentRep.findAndCheckExistsBy(
      { where: { id: documentId } },
      'documentId',
      documentId,
    );

    await this.s3Provider.delete(document.fileUrl);
    await this.documentRep.remove({ where: { id: documentId } });
  }
}
