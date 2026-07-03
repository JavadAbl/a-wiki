import { Prisma } from 'src/generated/prisma/client';

export type UserWithPermissions = Prisma.UserGetPayload<{
  include: { userPermissions: { select: { permission: { select: { name: true } } } } };
}>;

export abstract class IUserServiceContract {
  abstract userGetByUsername(username: string): Promise<UserWithPermissions | null>;
}
