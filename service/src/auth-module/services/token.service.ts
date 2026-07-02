// src/modules/auth/services/token.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { SignOptions } from 'jsonwebtoken';
import {
  DecodedToken,
  ITokenService,
  TokenPayload,
  TokenResponse,
} from '../contracts/token-service.contract';

@Injectable()
export class TokenService implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly ACCESS_TOKEN_EXPIRES_IN = '60m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  constructor(private readonly configService: ConfigService) {
    this.accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  generateTokens(payload: TokenPayload): TokenResponse {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'your-app-name',
      audience: 'your-app-users',
    };
    return jwt.sign(payload, this.accessSecret, options);
  }

  generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN };
    return jwt.sign(payload, this.refreshSecret, options);
  }

  verifyAccessToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, this.accessSecret) as DecodedToken;
    } catch {
      throw new UnauthorizedException('Invalid or Expired Access Token');
    }
  }

  verifyRefreshToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, this.refreshSecret) as DecodedToken;
    } catch {
      throw new UnauthorizedException('Invalid or Expired Refresh Token');
    }
  }
}
