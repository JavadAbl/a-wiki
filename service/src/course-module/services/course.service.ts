import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { CourseCreateDto } from '../dto/request/course-create.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { CourseSetPublishedDto } from '../dto/request/course-set-published.dto';
import { CourseDto } from '../dto/response/course.dto';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { plainToInstance } from 'class-transformer';
import { CourseDetailsDto } from '../dto/response/course-details.dto';
import { CourseSetDescriptionDto } from '../dto/request/course-set-description.dto';

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

  async courseGetMany(query: GetManyQueryType<'Course'>): Promise<GetManyReply<CourseDto>> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['title'] });
    const { items, totalCount } = await this.courseRep.findMany(predicate);
    const coursesDto = plainToInstance(CourseDto, items);
    return { items: coursesDto, totalCount };
  }

  async courseCreate(payload: CourseCreateDto): Promise<CourseDto> {
    const { title, categoryId } = payload;

    await this.courseRep.checkDuplicateBy({ where: { title } }, 'title', title);

    if (categoryId)
      await this.categoryRep.findAndCheckExistsBy({ where: { id: categoryId } }, 'id', categoryId);

    const course = await this.courseRep.create({ data: payload });
    return course;
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
}
