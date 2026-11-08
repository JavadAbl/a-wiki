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
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { type Response } from 'express';
import { GetManyQuery, GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { UserCreateDto } from '../dto/request/user-create.dto';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { UserService } from '../services/user.service';
import { UserDto } from '../dto/response/user.dto';
import { UserSetActiveDto } from '../dto/request/user-set-active.dto';
import { UserChangePasswordDto } from '../dto/request/user-change-password.dto';
import { User } from 'src/common/decorators/user.decorator';
import { type TokenPayload } from 'src/auth-module/contracts/token-service.contract';
import { Public } from 'src/common/decorators/public.decorator';
import { UserChangePasswordOtpDto } from '../dto/request/user-change-password-otp.dto';
import { UserUpdateDto } from '../dto/request/user-update.dto';
import { Admin } from 'src/common/decorators/admin.decorator';
import { UserBatchService } from '../services/user-batch.service';
import { UserBatchResultDto } from '../dto/response/user-batch-result.dto';

@Controller('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userBatchService: UserBatchService,
  ) {}

  /*   @Public()
  @Get('test')
  test() {
    return this.userService.insertData();
  } */

  @Admin()
  @Get('Batch/Template')
  async userBatchTemplate(@Res() res: Response): Promise<void> {
    const buffer = await this.userBatchService.buildTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="users-template.xlsx"');
    res.send(buffer);
  }

  @Admin()
  @Post('Batch')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  userBatchCreate(@UploadedFile() file?: Express.Multer.File): Promise<UserBatchResultDto> {
    if (!file?.buffer || file.size === 0) throw new BadRequestException('فایلی انتخاب نشده است.');
    if (!/\.xlsx$/i.test(file.originalname))
      throw new BadRequestException('فقط فایل اکسل با پسوند xlsx پذیرفته می‌شود.');
    return this.userBatchService.createFromWorkbook(file.buffer);
  }

  @Get()
  userGetMany(@Query() query: GetManyQuery, @User() context: TokenPayload): Promise<GetManyReply<UserDto>> {
    return this.userService.userGetMany(query as GetManyQueryType<'User'>, context);
  }

  @Get('Context')
  userGetByContext(@User() tokenPayload: TokenPayload): Promise<UserDto> {
    return this.userService.userGetById(tokenPayload.userId);
  }

  @Get(':userId')
  userGetById(@Param('userId', ParseIntPipe) id: number): Promise<UserDto> {
    return this.userService.userGetById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  userCreate(@Body() payload: UserCreateDto): Promise<number> {
    return this.userService.userCreate(payload);
  }

  @Public()
  @Post('sa')
  @HttpCode(HttpStatus.CREATED)
  superAdminCreate(@Body() payload: { seedPass: string }): Promise<void> {
    return this.userService.superAdminCreate(payload.seedPass);
  }

  @Public()
  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  adminCreate(
    @Body()
    payload: {
      seedPass: string;
      mobile: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
    },
  ): Promise<void> {
    return this.userService.adminCreate(
      payload.seedPass,
      payload.mobile,
      payload.password,
      payload.firstName,
      payload.lastName,
      payload.username,
    );
  }

  @Patch(':id/SetIsActive')
  userSetIsActive(@Param('id', ParseIntPipe) id: number, @Body() payload: UserSetActiveDto): Promise<void> {
    return this.userService.userSetIsActive(id, payload);
  }

  @Patch('ChangePassword')
  userChangePassword(@User() user: TokenPayload, @Body() payload: UserChangePasswordDto): Promise<void> {
    return this.userService.userChangePassword(user.userId, payload);
  }

  @Public()
  @Patch('ChangePasswordOtp')
  userChangePasswordOtp(@Body() payload: UserChangePasswordOtpDto): Promise<void> {
    return this.userService.userChangePasswordOtp(payload);
  }

  @Patch(':userId')
  userUpdate(@Param('userId') id: number, @Body() payload: UserUpdateDto): Promise<void> {
    return this.userService.userUpdate(id, payload);
  }
}
