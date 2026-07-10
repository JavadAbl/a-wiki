import { Module } from '@nestjs/common';
import { CourseRepository } from './repositories/course.repository';
import { PartRepository } from './repositories/part.repository';
import { SectionRepository } from './repositories/section.repository';
import { ContentRepository } from './repositories/content.repository';
import { DocumentRepository } from './repositories/document.repository';
import { CategoryRepository } from './repositories/category.repository';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { SectionService } from './services/section.service';
import { PartService } from './services/part.service';
import { ContentService } from './services/content.service';
import { PartViewRepository } from './repositories/part-view.repository';

@Module({
  imports: [],
  controllers: [CourseController],
  providers: [
    CourseRepository,
    PartRepository,
    SectionRepository,
    ContentRepository,
    DocumentRepository,
    CategoryRepository,
    PartViewRepository,

    CourseService,
    SectionService,
    PartService,
    ContentService,
  ],
  exports: [],
})
export class CourseModule {}
