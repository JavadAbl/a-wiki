import { Controller, Post, Body, Param, HttpCode, HttpStatus, ParseIntPipe, Delete } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dto/response/auth.dto';
import { LoginDto } from '../dto/request/login.dto';
import { RolePermissionCreateDto } from '../dto/request/role-permission-create.dto';
import { UserPermissionCreateDto } from '../dto/request/user-permission-create.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('Login')
  authGetMany(@Body() payload: LoginDto): Promise<AuthDto> {
    return this.authService.login(payload);
  }

  @Post('RolePermissions')
  @HttpCode(HttpStatus.CREATED)
  RolePermissionCreate(@Body() payload: RolePermissionCreateDto): Promise<void> {
    return this.authService.rolePermissionCreate(payload);
  }

  @Delete('RolePermissions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  RolePermissionDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.authService.rolePermissionDelete(id);
  }

  @Post('UserPermissions')
  @HttpCode(HttpStatus.CREATED)
  UserPermissionCreate(@Body() payload: UserPermissionCreateDto): Promise<void> {
    return this.authService.userPermissionCreate(payload);
  }

  @Delete('UserPermissions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  UserPermissionDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.authService.userPermissionDelete(id);
  }
}
