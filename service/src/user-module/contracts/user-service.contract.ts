import { User } from 'src/generated/prisma/client';

export abstract class IUserServiceContract {
  abstract userGetByUsername(username: string): Promise<User | null>;
}
