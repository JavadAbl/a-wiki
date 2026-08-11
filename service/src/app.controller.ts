import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { UserServiceContract } from './user-module/contracts/user-service.contract';
import { CourseServiceContract } from './course-module/contracts/course-service.contract';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserServiceContract,
    private readonly courseService: CourseServiceContract,
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
}
