import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { CourseCreateDto } from '../dto/request/course-create.dto';
import { CourseSetPublishedDto } from '../dto/request/course-set-published.dto';
import { CourseDto } from '../dto/response/course.dto';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { plainToInstance } from 'class-transformer';
import { CourseDetailsDto } from '../dto/response/course-details.dto';
import { CourseSetDescriptionDto } from '../dto/request/course-set-description.dto';
import { join } from 'path';
import { rm } from 'fs/promises';
import { UserCourseRepository } from '../repositories/user-course.repository';
import { TokenPayload } from 'src/auth-module/contracts/token-service.contract';
import { UserCourseDetailsDto } from '../dto/response/user-course-details.dto';

@Injectable()
export class UserCourseService {
  constructor(
    private readonly userCourseRep: UserCourseRepository,
    private readonly courseRep: CourseRepository,
  ) {}

  /*   async userCourseGetById(id: number, tokenPayload: TokenPayload): Promise<UserCourseDetailsDto> {
    const userCourse = await this.userCourseRep.findAndCheckExistsBy(
      { where: { id, userId: tokenPayload.userId }, select: { id: true }, include: { course: {include:} } },
      'id',
      id,
    );
    return userCourse;
  } */
}
