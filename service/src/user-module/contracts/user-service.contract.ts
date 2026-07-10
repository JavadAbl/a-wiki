import { Prisma, User } from 'src/generated/prisma/client';

export type UserWithPermissions = Prisma.UserGetPayload<{
  include: { userPermissions: { select: { permission: { select: { name: true } } } } };
}>;

export abstract class UserServiceContract {
  abstract userGetByUsername(username: string): Promise<UserWithPermissions | null>;
  abstract userGetByMobile(mobile: string): Promise<UserWithPermissions | null>;
  abstract userGetById(id: number): Promise<User | null>;
}
