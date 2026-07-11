import type { UserDto } from "../../user/dto/user.dto";

export interface AuthDto {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}
