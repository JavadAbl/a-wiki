// auth.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DECORATOR_AUTH_KEY } from '../decorators/decorator-keys';
import { AuthService } from 'src/auth-module/services/auth.service';
import { Request } from 'express';
import { Role } from 'src/generated/prisma/enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const actionPermission = this.reflector.getAllAndOverride<string>(DECORATOR_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!actionPermission) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) throw new ForbiddenException('User information is missing in the request.');

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
      const roleMatch = await this.authService.findIncludedRolePermission(userRole as Role, actionPermission);
      if (roleMatch) return true;
    }

    throw new ForbiddenException();
  }
}
