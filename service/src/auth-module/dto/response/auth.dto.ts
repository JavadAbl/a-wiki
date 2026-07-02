import { Exclude, Expose } from 'class-transformer';
import { UserDto } from 'src/user-module/dto/response/user.dto';

@Exclude()
export class AuthDto {
  @Expose()
  user: UserDto;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
