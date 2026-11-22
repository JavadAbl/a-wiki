// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ITokenService } from 'src/auth-module/contracts/token-service.contract';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly tokenService: ITokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const authorizeHeader: string | undefined = request.headers?.['authorization'];

    if (isPublic) {
      // On public routes a valid token is optional: populate request.user when present
      // so group rules can apply to logged-in users, but never block anonymous callers.
      if (authorizeHeader) {
        try {
          const accessToken = authorizeHeader.split(' ')?.[1];
          request.user = await this.tokenService.verifyAccessToken(accessToken);
        } catch {
          // Ignore invalid/expired tokens on public routes.
        }
      }
      return true;
    }

    if (!authorizeHeader) throw new UnauthorizedException();

    const accessToken = authorizeHeader.split(' ')?.[1];

    const tokenPayload = await this.tokenService.verifyAccessToken(accessToken);
    request.user = tokenPayload;
    return true;
  }
}
