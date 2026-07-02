// auth.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DECORATOR_AUTH_KEY } from '../decorators/decorator-keys';
import { AuthService } from 'src/auth-module/services/auth.service';

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

    const request = context.switchToHttp().getRequest();

    const userRole = request.headers['x-user-role'];
    const userPermissions: string[] =
      request.headers['x-user-permissions'] && JSON.parse(request.headers['x-user-permissions']);

    if (userRole === 'Admin') return true;

    if (userPermissions && Array.isArray(userPermissions)) {
      const permissionMatch = userPermissions.some((userPermission) =>
        actionPermission.includes(userPermission),
      );
      if (permissionMatch) return true;
    }

    if (userRole) {
      const roleMatch = await this.authService.findIncludedRolePermission(userRole, actionPermission);
      if (roleMatch) return true;
    }

    throw new ForbiddenException();
  }
}
