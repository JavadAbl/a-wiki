import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { GetManyQuery, GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { CourseService } from '../services/course.service';
import { CourseDto } from '../dto/response/course.dto';
import { CourseSetPublishedDto } from '../dto/request/course-set-published.dto';
import { CourseCreateDto } from '../dto/request/course-create.dto';
import { CourseDetailsDto } from '../dto/response/course-details.dto';
import { CourseSetDescriptionDto } from '../dto/request/course-set-description.dto';
import { SectionService } from '../services/section.service';
import { SectionSetDescriptionDto } from '../dto/request/section-set-description.dto';

@Controller('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly sectionService: SectionService,
  ) {}

  @Get()
  courseGetMany(@Query() query: GetManyQuery): Promise<GetManyReply<CourseDto>> {
    return this.courseService.courseGetMany(query as GetManyQueryType<'Course'>);
  }

  @Get(':courseId')
  courseGetById(@Param('courseId', ParseIntPipe) id: number): Promise<CourseDetailsDto> {
    return this.courseService.courseGetById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  courseCreate(@Body() payload: CourseCreateDto): Promise<CourseDto> {
    return this.courseService.courseCreate(payload);
  }

  @Patch(':courseId/SetPublished')
  courseSetIsActive(
    @Param('courseId', ParseIntPipe) id: number,
    @Body() payload: CourseSetPublishedDto,
  ): Promise<void> {
    return this.courseService.courseSetPublished(id, payload);
  }

  @Patch(':courseId/SetDescription')
  courseSetDescription(
    @Param('courseId', ParseIntPipe) id: number,
    @Body() payload: CourseSetDescriptionDto,
  ): Promise<void> {
    return this.courseService.courseSetDescription(id, payload);
  }

  //Section---------------------------------------------------------
  @Post(':courseId/Section')
  @HttpCode(HttpStatus.CREATED)
  sectionCreate(
    @Param('courseId', ParseIntPipe) id: number,
    @Body() payload: CourseCreateDto,
  ): Promise<CourseDto> {
    return this.courseService.courseCreate(payload);
  }

  @Patch('Sections/:sectionId/SetDescription')
  sectionSetDescription(
    @Param('sectionId', ParseIntPipe) id: number,
    @Body() payload: SectionSetDescriptionDto,
  ): Promise<void> {
    return this.courseService.courseSetDescription(id, payload);
  }
}
