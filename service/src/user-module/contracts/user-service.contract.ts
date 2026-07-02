import { UserDto } from '../dto/response/user.dto';

export abstract class IUserServiceContract {
  abstract userGetById(id: number): Promise<UserDto>;
}
