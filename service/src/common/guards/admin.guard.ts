// auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthServiceContract } from 'src/auth-module/contracts/auth-service.contract';
import { Admin_KEY } from '../decorators/admin.decorator';
import { Role } from 'src/auth-module/enums/role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthServiceContract,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdmin = this.reflector.getAllAndOverride<boolean>(Admin_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isAdmin) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) throw new UnauthorizedException('User information is missing in the request.');

    const userRole = user.role;

    if (userRole === (Role.SuperAdmin as string) || userRole === (Role.Admin as string)) return true;

    throw new ForbiddenException('You do not have the required permissions for this action.');
  }
}
