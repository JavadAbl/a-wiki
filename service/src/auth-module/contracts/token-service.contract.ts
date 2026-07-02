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
  abstract generateTokens(payload: TokenPayload): Promise<TokenResponse>;
  abstract generateAccessToken(payload: TokenPayload): Promise<string>;
  abstract generateRefreshToken(payload: TokenPayload): Promise<string>;
  abstract verifyAccessToken(token: string): Promise<DecodedToken>;
  abstract verifyRefreshToken(token: string): Promise<DecodedToken>;
}
