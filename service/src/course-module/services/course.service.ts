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
import { join } from 'path';
import { rm } from 'fs/promises';
import { plainToInstance } from 'class-transformer';
import { Prisma } from 'src/generated/prisma/client';
import { CourseUpdateDto } from '../dto/request/course-update.dto';
import { S3Provider } from 'src/infrastructure-modules/s3-module/s3.provider';

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
      documents: course.documents, // map to DocumentDto if needed
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

    // 4. Merge and transform
    const mappedItems = items.map(async (course) => {
      let publicThumbnailUrl;
      if (course.thumbnailUrl)
        publicThumbnailUrl = await this.s3Provider.getSignedUrlByKey(course.thumbnailUrl, 86400); //1 day expiration

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
    });

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
    // Fetch the part with its relations so we can build the file system path
    await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'courseId', courseId);

    // Construct the base directory for this specific part
    const partDir = join(process.cwd(), 'files', 'courses', `${courseId}`);

    // Delete the entire directory for this part (removes both 'videos' and 'sounds' subdirectories)
    // `recursive: true` ensures all nested files are deleted
    // `force: true` prevents the app from crashing if the directory was already deleted or never created
    await rm(partDir, { recursive: true, force: true });

    // Finally, remove the database record
    await this.courseRep.remove({ where: { id: courseId } });
  }
}
