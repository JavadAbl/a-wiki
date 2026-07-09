import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from '../repository/user.repository';
import { UserDto } from '../dto/response/user.dto';
import { UserCreateDto } from '../dto/request/user-create.dto';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { UserSetActiveDto } from '../dto/request/user-set-active.dto';
import { PasswordService } from 'src/auth-module/services/password.service';
import { UserChangePasswordDto } from '../dto/request/user-change-password.dto';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/common/config/config.type';
import { Role } from 'src/generated/prisma/enums';
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import { UserChangePasswordOtpDto } from '../dto/request/user-change-password-otp.dto';
import { ITestServiceContract } from 'src/contract-module/contracts/test-service.contract';

@Injectable()
export class TestService implements ITestServiceContract {
  constructor() {}
  getTest() {
    console.log('ok');
  }
}
