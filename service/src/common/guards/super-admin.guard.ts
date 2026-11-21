import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SA_KEY } from '../decorators/sa.decorator';
import { Role } from 'src/auth-module/enums/role.enum';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSa = this.reflector.getAllAndOverride<boolean>(SA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isSa) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) throw new ForbiddenException('You do not have the required permissions for this action.');

    if (user.role === (Role.SuperAdmin as string)) return true;

    throw new ForbiddenException('You do not have the required permissions for this action.');
  }
}
