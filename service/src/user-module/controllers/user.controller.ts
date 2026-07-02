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

@Controller('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  userGetMany(@Query() query: GetManyQuery): Promise<GetManyReply<UserDto>> {
    return this.userService.userGetMany(query as GetManyQueryType<'User'>);
  }

  @Get(':id')
  userGetById(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.userService.userGetById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  userCreate(@Body() payload: UserCreateDto): Promise<UserDto> {
    return this.userService.userCreate(payload);
  }

  @Patch()
  userSetIsActive(@Body() payload: UserSetActiveDto): Promise<void> {
    return this.userService.userSetIsActive(payload);
  }

  @Patch()
  userChangePassword(@Body() payload: UserSetActiveDto): Promise<void> {
    return this.userService.userSetIsActive(payload);
  }
}
