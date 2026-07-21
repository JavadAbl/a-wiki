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
import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { DocumentService } from './services/document.service';
import { ThumbnailRepository } from './repositories/thumbnail.repository';
import { ThumbnailService } from './services/thumbnail.service';

@Module({
  imports: [],
  controllers: [CourseController, CategoryController],
  providers: [
    CourseRepository,
    PartRepository,
    SectionRepository,
    ContentRepository,
    DocumentRepository,
    CategoryRepository,
    PartViewRepository,
    ThumbnailRepository,

    CourseService,
    SectionService,
    PartService,
    ContentService,
    CategoryService,
    DocumentService,
    ThumbnailService,
  ],
  exports: [],
})
export class CourseModule {}
