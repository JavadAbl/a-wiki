import { Controller, Post, Body, Param, HttpCode, HttpStatus, ParseIntPipe, Delete } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dto/response/auth.dto';
import { LoginDto } from '../dto/request/login.dto';
import { RolePermissionCreateDto } from '../dto/request/role-permission-create.dto';

@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('Login')
  authGetMany(@Body() payload: LoginDto): Promise<AuthDto> {
    return this.authService.login(payload);
  }

  @Post('RolePermissions')
  @HttpCode(HttpStatus.CREATED)
  RolePermissionCreate(@Body() payload: RolePermissionCreateDto): Promise<void> {
    return this.authService.createRolePermission(payload);
  }

  @Delete('RolePermissions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  RolePermissionDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.authService.deleteRolePermission(id);
  }
}
