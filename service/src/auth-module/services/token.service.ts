// src/modules/auth/services/token.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { SignOptions } from 'jsonwebtoken';
import { promisify } from 'util';
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

  private readonly signAsync: (
    payload: string | object | Buffer,
    secretOrPrivateKey: jwt.Secret,
    options?: SignOptions,
  ) => Promise<string>;

  private readonly verifyAsync: (
    token: string,
    secretOrPublicKey: jwt.Secret,
    options?: jwt.VerifyOptions,
  ) => Promise<object | string>;

  constructor(private readonly configService: ConfigService) {
    this.accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    this.signAsync = promisify<string | object | Buffer, jwt.Secret, SignOptions | undefined, string>(
      jwt.sign,
    );
    this.verifyAsync = promisify<string, jwt.Secret, jwt.VerifyOptions | undefined, object | string>(
      jwt.verify,
    );
  }

  async generateTokens(payload: TokenPayload): Promise<TokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const options: SignOptions = {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'your-app-name',
      audience: 'your-app-users',
    };
    return this.signAsync(payload, this.accessSecret, options);
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    const options: SignOptions = { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN };
    return this.signAsync(payload, this.refreshSecret, options);
  }

  async verifyAccessToken(token: string): Promise<DecodedToken> {
    try {
      const decoded = await this.verifyAsync(token, this.accessSecret);
      return decoded as DecodedToken;
    } catch {
      throw new UnauthorizedException('Invalid or Expired Access Token');
    }
  }

  async verifyRefreshToken(token: string): Promise<DecodedToken> {
    try {
      const decoded = await this.verifyAsync(token, this.refreshSecret);
      return decoded as DecodedToken;
    } catch {
      throw new UnauthorizedException('Invalid or Expired Refresh Token');
    }
  }
}
