// auth.guard.ts
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DECORATOR_AUTH_KEY } from '../decorators/decorator-keys';
import { ITokenService } from 'src/auth-module/contracts/token-service.contract';
import { Request } from 'express';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ITokenService) private readonly tokenService: ITokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const actionPermission = this.reflector.getAllAndOverride<string>(DECORATOR_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!actionPermission) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const authorizeHeader: string | undefined = request.headers?.['authorization'];

    if (!authorizeHeader) throw new UnauthorizedException();

    const accessToken = authorizeHeader.split(' ')?.[1];

    const tokenPayload = await this.tokenService.verifyAccessToken(accessToken);
    request.user = tokenPayload;
    return true;
  }
}
