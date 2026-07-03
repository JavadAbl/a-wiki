// auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth-module/services/auth.service';
import { Request } from 'express';
import { Role } from 'src/generated/prisma/enums';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { generateActionPermissionName } from 'src/auth-module/auth.utils';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) throw new UnauthorizedException('User information is missing in the request.');

    const controllerName = context.getClass().name;
    const actionName = context.getHandler().name;
    const actionPermission = generateActionPermissionName(controllerName, actionName);

    const userRole = user.role;
    const userPermissions = user.permissions;

    if (userRole === Role.SuperAdmin) return true;

    if (userPermissions && Array.isArray(userPermissions)) {
      const permissionMatch = userPermissions.some((userPermission) =>
        actionPermission.includes(userPermission),
      );
      if (permissionMatch) return true;
    }

    if (userRole) {
      const roleMatch = await this.authService.rolePermissionFindByRoleAndPermissionName(
        userRole as Role,
        actionPermission,
      );
      if (roleMatch) return true;
    }

    throw new ForbiddenException('You do not have the required permissions for this action.');
  }
}
