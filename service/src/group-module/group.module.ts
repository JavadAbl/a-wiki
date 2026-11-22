import { Module } from '@nestjs/common';
import { GroupController } from './controllers/group.controller';
import { GroupRepository } from './repositories/group.repository';
import { GroupCourseRepository } from './repositories/group-course.repository';
import { GroupCategoryRepository } from './repositories/group-category.repository';
import { GroupService } from './services/group.service';
import { AccessService } from './services/access.service';

@Module({
  controllers: [GroupController],
  providers: [
    GroupRepository,
    GroupCourseRepository,
    GroupCategoryRepository,
    GroupService,
    AccessService,
  ],
  exports: [AccessService],
})
export class GroupModule {}
