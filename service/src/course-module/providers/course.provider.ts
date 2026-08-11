import { Injectable } from '@nestjs/common';
import { CourseServiceContract } from '../contracts/course-service.contract';
import { CourseRepository } from '../repositories/course.repository';
import { ContentRepository } from '../repositories/content.repository';

@Injectable()
export class CourseProvider implements CourseServiceContract {
  constructor(
    private readonly courseRep: CourseRepository,
    private readonly contentRep: ContentRepository,
  ) {}
  courseCount(): Promise<number> {
    return this.courseRep.count();
  }
  async courseDuration(): Promise<number> {
    const result = await this.contentRep.prismaClient.content.aggregate({ _sum: { durationSeconds: true } });

    return result._sum.durationSeconds ?? 0;
  }
}
