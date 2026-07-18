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

@Controller('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Patch(':userId')
  userUpdate(@Param('userId') id: number, @Body() payload: UserUpdateDto): Promise<void> {
    return this.userService.userUpdate(id, payload);
  }

  @Public()
  @Post('sa')
  @HttpCode(HttpStatus.CREATED)
  superAdminCreate(@Body() payload: { seedPass: string }): Promise<void> {
    return this.userService.superAdminCreate(payload.seedPass);
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
}
