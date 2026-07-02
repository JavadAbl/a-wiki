export interface TokenPayload {
  userId: number;
  role?: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export abstract class ITokenService {
  abstract generateTokens(payload: TokenPayload): TokenResponse;
  abstract generateAccessToken(payload: TokenPayload): string;
  abstract generateRefreshToken(payload: TokenPayload): string;
  abstract verifyAccessToken(token: string): DecodedToken;
  abstract verifyRefreshToken(token: string): DecodedToken;
}
