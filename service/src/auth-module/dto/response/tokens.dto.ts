import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TokensDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
