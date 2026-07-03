import { Module } from '@nestjs/common';
import { CourseRepository } from './repositories/course.repository';
import { PartRepository } from './repositories/part.repository';
import { SectionRepository } from './repositories/section.repository';
import { ContentRepository } from './repositories/content.repository';
import { DocumentRepository } from './repositories/document.repository';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    CourseRepository,
    PartRepository,
    SectionRepository,
    ContentRepository,
    DocumentRepository,
    CategoryRepository,
  ],
  exports: [],
})
export class CourseModule {}
