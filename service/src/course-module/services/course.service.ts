import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { CourseCreateDto } from '../dto/request/course-create.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { CourseSetPublishedDto } from '../dto/request/course-set-published.dto';
import { CourseDto } from '../dto/response/course.dto';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { CourseDetailsDto } from '../dto/response/course-details.dto';
import { CourseSetDescriptionDto } from '../dto/request/course-set-description.dto';
import { extname } from 'path';
import { plainToInstance } from 'class-transformer';
import { Prisma } from 'src/generated/prisma/client';
import { CourseUpdateDto } from '../dto/request/course-update.dto';
import { S3Provider } from 'src/infrastructure-modules/s3-module/s3.provider';
import pLimit from 'p-limit';
import { createHash } from 'crypto';
import { random5Digit } from 'src/common/utils/app.utils';
import { DocumentDto } from '../dto/response/document.dto';
import { Jimp, JimpMime } from 'jimp';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRep: CourseRepository,
    private readonly categoryRep: CategoryRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async courseGetById(id: number): Promise<CourseDetailsDto> {
    const prisma = this.courseRep.prismaClient;

    // 1. Fetch the course with nested structure (ordered)
    const course = await this.courseRep.findAndCheckExistsBy(
      {
        where: { id },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              parts: {
                orderBy: { order: 'asc' },
                include: { contents: { orderBy: { order: 'asc' }, omit: { mediaUrl: true } } },
              },
            },
          },
          documents: true,
        },
      },
      'id',
      id,
    );

    // 2. Course-level aggregates
    const courseAgg = await prisma.content.aggregate({
      where: { part: { section: { courseId: id } } },
      _count: { _all: true },
      _sum: { durationSeconds: true },
    });

    // 3. Section-level aggregates (one query, grouped in JS)
    const sectionAggRows = await prisma.content.findMany({
      where: { part: { section: { courseId: id } } },
      select: { durationSeconds: true, part: { select: { sectionId: true } } },
    });

    const sectionAgg = new Map<number, { count: number; length: number }>();
    for (const r of sectionAggRows) {
      const sid = r.part.sectionId;
      const e = sectionAgg.get(sid) ?? { count: 0, length: 0 };
      e.count += 1;
      e.length += r.durationSeconds;
      sectionAgg.set(sid, e);
    }

    // 4. Part-level aggregates (reuse same rows or compute from course data)
    const partAgg = new Map<number, { count: number; length: number }>();

    // Simpler: compute part-level from the already-fetched `course` tree
    for (const s of course.sections) {
      for (const p of s.parts) {
        partAgg.set(p.id, {
          count: p.contents.length,
          length: p.contents.reduce((a, c) => a + c.durationSeconds, 0),
        });
      }
    }

    let publicThumbnailUrl;
    if (course.thumbnailUrl)
      publicThumbnailUrl = await this.s3Provider.getSignedUrlByKey(course.thumbnailUrl, 86400); //1 day expiration

    const documents: DocumentDto[] = [];
    for (const doc of course.documents) {
      const publicDocumentUrl = await this.s3Provider.getSignedUrlByKey(doc.fileUrl, 86400); //1 day expiration
      documents.push({ ...doc, fileUrl: publicDocumentUrl });
    }

    // 5. Build DTO
    const dto: CourseDetailsDto = {
      id: course.id,
      title: course.title,
      description: course.description,
      categoryId: course.categoryId,
      isPublished: course.isPublished,
      thumbnailUrl: publicThumbnailUrl,
      lecturer: course.lecturer,
      lecturerProfession: course.lecturerProfession,
      documents,
      totalContents: courseAgg._count._all,
      totalContentsLength: courseAgg._sum.durationSeconds ?? 0,
      sections: course.sections.map((s) => {
        const sa = sectionAgg.get(s.id) ?? { count: 0, length: 0 };
        return {
          id: s.id,
          title: s.title,
          description: s.description,
          order: s.order,
          documents: undefined as any,
          totalContents: sa.count,
          totalContentsLength: sa.length,
          parts: s.parts.map((p) => {
            const pa = partAgg.get(p.id) ?? { count: 0, length: 0 };
            return {
              id: p.id,
              title: p.title,
              description: p.description,
              order: p.order,
              totalContents: pa.count,
              totalContentsLength: pa.length,
              contents: p.contents, // map to ContentDto if needed
            };
          }),
        };
      }),
    };

    return plainToInstance(CourseDetailsDto, dto, { excludeExtraneousValues: true });
  }

  async courseGetMany(
    query: GetManyQueryType<'Course'>,
    adminCourses: boolean,
    categoryId?: number,
  ): Promise<GetManyReply<CourseDto>> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['title'] });

    let isPublished: boolean | undefined;
    if (adminCourses) isPublished = undefined;
    else isPublished = true;

    const { items, totalCount } = await this.courseRep.findMany({
      ...predicate,
      where: { ...predicate.where, categoryId, isPublished },
      orderBy: { id: 'desc' },
    });

    if (items.length === 0) {
      return { items: [], totalCount: 0 };
    }

    const courseIds = items.map((c) => c.id);

    // 2. Use $queryRaw on the client instance for multi-table aggregation
    const aggregates = await this.courseRep.prismaClient.$queryRaw<
      Array<{ courseId: number; totalContents: bigint; totalContentsLength: bigint }>
    >`
    SELECT 
      c."id" as "courseId",
      COUNT(ct."id") as "totalContents",
      COALESCE(SUM(ct."durationSeconds"), 0) as "totalContentsLength"
    FROM "Course" c
    LEFT JOIN "Section" s ON s."courseId" = c."id"
    LEFT JOIN "Part" p ON p."sectionId" = s."id"
    LEFT JOIN "Content" ct ON ct."partId" = p."id"
    WHERE c."id" IN (${Prisma.join(courseIds)})
    GROUP BY c."id"
  `;

    // 3. Create a map for quick lookup
    // Note: PostgreSQL returns BIGINT for COUNT/SUM which maps to BigInt in Node.js
    const aggregateMap = new Map(
      aggregates.map((a) => [
        a.courseId,
        { totalContents: Number(a.totalContents), totalContentsLength: Number(a.totalContentsLength) },
      ]),
    );

    const limit = pLimit(10);

    // 4. Merge and transform
    const mappedItems = await Promise.all(
      items.map((course) =>
        limit(async () => {
          let publicThumbnailUrl;
          if (course.thumbnailUrl) {
            publicThumbnailUrl = await this.s3Provider.getSignedUrlByKey(course.thumbnailUrl, 86400);
          }

          const stats = aggregateMap.get(course.id) || { totalContents: 0, totalContentsLength: 0 };

          return plainToInstance(CourseDto, {
            id: course.id,
            title: course.title,
            description: course.description,
            categoryId: course.categoryId,
            isPublished: course.isPublished,
            thumbnailUrl: publicThumbnailUrl,
            lecturer: course.lecturer,
            lecturerProfession: course.lecturerProfession,
            totalContents: stats.totalContents,
            totalContentsLength: stats.totalContentsLength,
          });
        }),
      ),
    );

    // Note: For accurate pagination, consider using a separate COUNT query
    // instead of items.length when using LIMIT/OFFSET
    return { items: mappedItems, totalCount };
  }

  async courseCreate(payload: CourseCreateDto): Promise<number> {
    const { title, categoryId } = payload;

    await this.courseRep.checkDuplicateBy({ where: { title } }, 'title', title);

    if (categoryId)
      await this.categoryRep.findAndCheckExistsBy({ where: { id: categoryId } }, 'id', categoryId);

    const course = await this.courseRep.create({ data: payload });
    return course.id;
  }

  async courseSetPublished(courseId: number, payload: CourseSetPublishedDto): Promise<void> {
    const { isPublished } = payload;
    const course = await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'id', courseId);

    if (course.isPublished === payload.isPublished)
      throw new BadRequestException(`Course is already ${isPublished ? 'published' : 'unpublished'}`);

    await this.courseRep.update({ where: { id: courseId }, data: { isPublished: isPublished } });
  }

  async courseSetDescription(courseId: number, payload: CourseSetDescriptionDto): Promise<void> {
    const { description } = payload;
    await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'id', courseId);

    await this.courseRep.update({ where: { id: courseId }, data: { description: description } });
  }

  async courseUpdate(courseId: number, payload: CourseUpdateDto): Promise<void> {
    await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'id', courseId);
    await this.courseRep.update({ where: { id: courseId }, data: payload });
  }

  async courseDelete(courseId: number) {
    await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'courseId', courseId);

    const s3Key = ['courses', String(courseId)].join('/');

    await this.s3Provider.deletePrefixVersions(s3Key);

    await this.courseRep.remove({ where: { id: courseId } });
  }

  /*  async thumbnailCreate(courseId: number, file: Express.Multer.File): Promise<void> {
    if (!file) throw new BadRequestException('Wrong file');

    await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'courseId', courseId);

    // 2. Build the S3 key
    const ext = extname(file.originalname);
    const fileHash = createHash('md5').update(file.buffer).digest('hex');
    const uniqueFilename = `${random5Digit()}${fileHash}${ext}`;
    const s3Key = ['courses', String(courseId), 'thumbnails', uniqueFilename].join('/');

    // 4. Upload to S3
    await this.s3Provider.Put(s3Key, file.buffer, file.mimetype);

    // 5. Free memory
    file.buffer = null as any;

    await this.thumbnailDelete(courseId);

    // 6. Persist inside a transaction so order assignment is race-safe
    await this.courseRep.update({ where: { id: courseId }, data: { thumbnailUrl: s3Key } });
  } */

  // ... inside your service class
  async thumbnailCreate(courseId: number, file: Express.Multer.File): Promise<void> {
    if (!file) throw new BadRequestException('Wrong file');

    await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'courseId', courseId);

    let processedBuffer = file.buffer;
    let processedMimetype: any = file.mimetype;
    let processedExt = extname(file.originalname).toLowerCase();

    const SIZE_THRESHOLD = 200 * 1024; // 200KB

    if (file.size > SIZE_THRESHOLD) {
      // 1. Read buffer (Jimp v1 uses fromBuffer or read)
      const image = await Jimp.fromBuffer(file.buffer);

      // 2. Scale to fit within 800x800 while maintaining aspect ratio
      image.scaleToFit({ w: 800, h: 800 });

      // 3. Force JPEG for maximum compression (PNGs stay large even when resized)
      if (processedMimetype !== 'image/jpeg' && processedMimetype !== 'image/jpg') {
        processedMimetype = JimpMime.jpeg;
        processedExt = '.jpg';
      }

      // 4. In Jimp v1, getBuffer is async and takes an options object for quality
      processedBuffer = await image.getBuffer(processedMimetype, { quality: 80 });
    }

    // 5. Build S3 key using the processed buffer
    const fileHash = createHash('md5').update(processedBuffer).digest('hex');
    const uniqueFilename = `${random5Digit()}${fileHash}${processedExt}`;
    const s3Key = ['courses', String(courseId), 'thumbnails', uniqueFilename].join('/');

    await this.s3Provider.Put(s3Key, processedBuffer, processedMimetype);

    // 6. Free memory
    processedBuffer = null as any;
    file.buffer = null as any;

    await this.courseRep.update({ where: { id: courseId }, data: { thumbnailUrl: s3Key } });
  }

  async thumbnailDelete(courseId: number): Promise<void> {
    const course = await this.courseRep.findAndCheckExistsBy(
      { where: { id: courseId } },
      'courseId',
      courseId,
    );

    if (course.thumbnailUrl) {
      await this.s3Provider.deleteAllVersions(course.thumbnailUrl);
      await this.courseRep.update({ where: { id: courseId }, data: { thumbnailUrl: null } });
    }
  }
}
