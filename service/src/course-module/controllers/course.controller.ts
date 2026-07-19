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
  UseInterceptors,
  UploadedFile,
  Delete,
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
import { PartService } from '../services/part.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentCreateDto } from '../dto/request/content-create.dto';
import { memoryStorage } from 'multer';
import { ContentService } from '../services/content.service';
import { PartCreateDto } from '../dto/request/part-create.dto';
import { SectionCreateDto } from '../dto/request/section-create.dto';
import { type Response } from 'express';
import { User } from 'src/common/decorators/user.decorator';
import { type TokenPayload } from 'src/auth-module/contracts/token-service.contract';
import { Public } from 'src/common/decorators/public.decorator';
import { DocumentCreateDto } from '../dto/request/document-create.dto';
import { DocumentService } from '../services/document.service';
import { ContentUpdateDto } from '../dto/request/content-update.dto';

@Controller('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly sectionService: SectionService,
    private readonly partService: PartService,
    private readonly contentService: ContentService,
    private readonly documentService: DocumentService,
  ) {}

  //Course---------------------------------------------------------
  @Public()
  @Get()
  courseGetMany(
    @Query() query: GetManyQuery,
    @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number,
  ): Promise<GetManyReply<CourseDto>> {
    return this.courseService.courseGetMany(query as GetManyQueryType<'Course'>, false, categoryId);
  }

  @Get('/Admin/GetMany')
  courseGetManyAdmin(
    @Query() query: GetManyQuery,
    @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number,
  ): Promise<GetManyReply<CourseDto>> {
    return this.courseService.courseGetMany(query as GetManyQueryType<'Course'>, true, categoryId);
  }

  @Get(':courseId')
  courseGetById(@Param('courseId', ParseIntPipe) id: number): Promise<CourseDetailsDto> {
    return this.courseService.courseGetById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  courseCreate(@Body() payload: CourseCreateDto): Promise<number> {
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

  @Delete(':courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  courseDelete(@Param('courseId', ParseIntPipe) id: number): Promise<void> {
    return this.courseService.courseDelete(id);
  }

  //Section---------------------------------------------------------
  @Post(':courseId/Sections')
  @HttpCode(HttpStatus.CREATED)
  sectionCreate(
    @Param('courseId', ParseIntPipe) id: number,
    @Body() payload: SectionCreateDto,
  ): Promise<number> {
    return this.sectionService.sectionCreate(id, payload);
  }

  @Patch('Sections/:sectionId/SetDescription')
  sectionSetDescription(
    @Param('sectionId', ParseIntPipe) id: number,
    @Body() payload: SectionSetDescriptionDto,
  ): Promise<void> {
    return this.sectionService.sectionSetDescription(id, payload);
  }

  //Part------------------------------------------------------------
  @Post('Sections/:sectionId/Parts')
  @HttpCode(HttpStatus.CREATED)
  partCreate(@Param('sectionId', ParseIntPipe) id: number, @Body() payload: PartCreateDto): Promise<number> {
    return this.partService.partCreate(id, payload);
  }

  @Post('Parts/:partId/SetView')
  @HttpCode(HttpStatus.CREATED)
  partSetView(
    @Param('sectionId', ParseIntPipe) id: number,
    @User() tokenPayload: TokenPayload,
  ): Promise<void> {
    return this.partService.partSetView(id, tokenPayload.userId);
  }

  @Patch('Parts/:partId/SetDescription')
  partSetDescription(
    @Param('sectionId', ParseIntPipe) id: number,
    @Body() payload: SectionSetDescriptionDto,
  ): Promise<void> {
    return this.partService.partSetDescription(id, payload);
  }

  //Content------------------------------------------------------------
  @Post('Parts/:partId/Contents')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  contentCreate(
    @Param('partId', ParseIntPipe) id: number,
    @Body() payload: ContentCreateDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<number> {
    return this.contentService.contentCreate(id, payload, file);
  }

  /* @Get('stream/:contentId')
  async contentStream(@Param('contentId', ParseIntPipe) contentId: number, @Res() res: Response) {
    const absolutePath = await this.contentService.contentFindAbsolutePath(contentId);

    // 7. Stream the file
    // res.sendFile automatically handles HTTP Range requests (allowing video seeking/scrubbing)
    res.sendFile(absolutePath, (err: any) => {
      if (err && !res.headersSent) {
        // Handle stream aborts gracefully (e.g., user closes the tab while loading)
        if (err.code !== 'ECONNABORTED' && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
          res.status(500).send('Error streaming file');
        }
      }
    });
  }
 */

  @Get('Contents/:contentId/URL')
  async contentGetURL(@Param('contentId', ParseIntPipe) contentId: number): Promise<{ url: string }> {
    return this.contentService.generatePresignedUrl(contentId);
  }

  @Patch('Contents/:contentId')
  contentUpdate(
    @Param('contentId', ParseIntPipe) id: number,
    @Body() payload: ContentUpdateDto,
  ): Promise<void> {
    return this.contentService.contentUpdate(id, payload);
  }

  @Delete('Contents/:contentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  contentDelete(@Param('contentId', ParseIntPipe) id: number): Promise<void> {
    return this.contentService.contentDelete(id);
  }

  //Document------------------------------------------------------------
  @Post(':courseId/Documents')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  documentCreate(
    @Param('courseId', ParseIntPipe) id: number,
    @Body() payload: DocumentCreateDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<number> {
    return this.documentService.documentCreate(id, payload, file);
  }
}
