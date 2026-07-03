import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { CourseCreateDto } from '../dto/request/course-create.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { CourseSetPublishedDto } from '../dto/request/course-set-published.dto';
import { CourseDto } from '../dto/response/course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRep: CourseRepository,
    private readonly categoryRep: CategoryRepository,
  ) {}

  async CourseCreate(payload: CourseCreateDto): Promise<CourseDto> {
    const { title, categoryId } = payload;

    await this.courseRep.checkDuplicateBy({ where: { title } }, 'title', title);

    if (categoryId)
      await this.categoryRep.findAndCheckExistsBy({ where: { id: categoryId } }, 'id', categoryId);

    const course = await this.courseRep.create({ data: payload });
    return course;
  }

  async CourseSetPublished(courseId: number, payload: CourseSetPublishedDto): Promise<void> {
    const course = await this.courseRep.findAndCheckExistsBy({ where: { id: courseId } }, 'id', courseId);

    if (course.isPublished === payload.isPublished)
      throw new BadRequestException(`Course is already ${payload.isPublished ? 'published' : 'unpublished'}`);

    await this.courseRep.update({ where: { id: courseId }, data: { isPublished: payload.isPublished } });
  }
}
