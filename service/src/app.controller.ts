import {
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from './common/decorators/public.decorator';
import { Admin } from './common/decorators/admin.decorator';
import { UserServiceContract } from './user-module/contracts/user-service.contract';
import { CourseServiceContract } from './course-module/contracts/course-service.contract';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserServiceContract,
    private readonly courseService: CourseServiceContract,
    private readonly appService: AppService,
  ) {}

  @Public()
  @Get('/health')
  health() {
    return 'ok';
  }

  @Public()
  @Get('/DashboardHeroData')
  async dashboardHeroData() {
    const [userCount, courseDuration, courseCount] = await Promise.all([
      this.userService.userCount(),
      this.courseService.courseDuration(),
      this.courseService.courseCount(),
    ]);

    return { userCount, courseDuration, courseCount };
  }

  @Public()
  @Get('/HeroImageURL')
  heroImageGetUrl(): { url: string | null } {
    return this.appService.heroImageGetUrl();
  }

  @Admin()
  @Post('/HeroImage')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  heroImageUpdate(@UploadedFile() file: Express.Multer.File): void {
    return this.appService.heroImageUpdate(file);
  }

  @Admin()
  @Delete('/HeroImage')
  @HttpCode(HttpStatus.NO_CONTENT)
  heroImageDelete(): void {
    return this.appService.heroImageDelete();
  }
}