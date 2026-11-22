import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GetManyQuery, GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { Admin } from 'src/common/decorators/admin.decorator';
import { GroupCreateDto } from '../dto/request/group-create.dto';
import { GroupUpdateDto } from '../dto/request/group-update.dto';
import { GroupSetCoursesDto } from '../dto/request/group-set-courses.dto';
import { GroupSetCategoriesDto } from '../dto/request/group-set-categories.dto';
import { GroupDto } from '../dto/response/group.dto';
import { GroupDetailsDto } from '../dto/response/group-details.dto';
import { GroupService } from '../services/group.service';

@Admin()
@Controller('Groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  groupGetMany(@Query() query: GetManyQuery): Promise<GetManyReply<GroupDto>> {
    return this.groupService.groupGetMany(query as GetManyQueryType<'Group'>);
  }

  // Literal paths must stay declared before @Get(':groupId')
  @Get(':groupId')
  groupGetById(@Param('groupId', ParseIntPipe) id: number): Promise<GroupDetailsDto> {
    return this.groupService.groupGetById(id);
  }

  @Patch(':groupId/SetCourses')
  groupSetCourses(
    @Param('groupId', ParseIntPipe) id: number,
    @Body() payload: GroupSetCoursesDto,
  ): Promise<void> {
    return this.groupService.groupSetCourses(id, payload.courseIds);
  }

  @Patch(':groupId/SetCategories')
  groupSetCategories(
    @Param('groupId', ParseIntPipe) id: number,
    @Body() payload: GroupSetCategoriesDto,
  ): Promise<void> {
    return this.groupService.groupSetCategories(id, payload.categoryIds);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  groupCreate(@Body() payload: GroupCreateDto): Promise<number> {
    return this.groupService.groupCreate(payload);
  }

  @Patch(':groupId')
  groupUpdate(
    @Param('groupId', ParseIntPipe) id: number,
    @Body() payload: GroupUpdateDto,
  ): Promise<void> {
    return this.groupService.groupUpdate(id, payload);
  }

  @Delete(':groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  groupDelete(@Param('groupId', ParseIntPipe) id: number): Promise<void> {
    return this.groupService.groupDelete(id);
  }
}
