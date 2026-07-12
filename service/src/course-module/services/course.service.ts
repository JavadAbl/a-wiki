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

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRep: CourseRepository,
    private readonly categoryRep: CategoryRepository,
  ) {}

  async courseGetById(id: number): Promise<CourseDetailsDto> {
    const course = await this.courseRep.findAndCheckExistsBy(
      { where: { id }, include: { sections: { include: { parts: true } }, documents: true } },
      'id',
      id,
    );
    return course;
  }

  async courseGetMany(
    query: GetManyQueryType<'Course'>,
    categoryId?: number,
  ): Promise<GetManyReply<CourseDto>> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['title'] });

    // 1. Fetch ONLY the course data (no heavy nested includes)
    const items = await this.courseRep.prismaClient.course.findMany({
      ...predicate,
      where: { ...predicate.where, categoryId },
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
    const mappedItems = items.map((course) => {
      const stats = aggregateMap.get(course.id) || { totalContents: 0, totalContentsLength: 0 };

      return plainToInstance(CourseDto, {
        id: course.id,
        title: course.title,
        description: course.description,
        categoryId: course.categoryId,
        isPublished: course.isPublished,
        thumbnailUrl: course.thumbnailUrl,
        lecturer: course.lecturer,
        lecturerProfession: course.lecturerProfession,
        totalContents: stats.totalContents,
        totalContentsLength: stats.totalContentsLength,
      });
    });

    // Note: For accurate pagination, consider using a separate COUNT query
    // instead of items.length when using LIMIT/OFFSET
    return { items: mappedItems, totalCount: items.length };
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
