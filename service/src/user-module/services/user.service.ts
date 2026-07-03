import { ForbiddenException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from '../repository/user.repository';
import { UserDto } from '../dto/response/user.dto';
import { UserCreateDto } from '../dto/request/user-create.dto';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { UserSetActiveDto } from '../dto/request/user-set-active.dto';
import { PasswordService } from 'src/auth-module/services/password.service';
import { UserChangePasswordDto } from '../dto/request/user-change-password.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRep: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async userGetById(id: number): Promise<UserDto> {
    const user = await this.userRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    return plainToInstance(UserDto, user);
  }

  async userGetMany(query: GetManyQueryType<'User'>): Promise<GetManyReply<UserDto>> {
    const predicate = buildFindManyArgs(query, {
      searchableFields: ['firstName', 'lastName', 'username', 'nationalCode'],
    });
    const { items, totalCount } = await this.userRep.findMany(predicate);
    const usersDto = plainToInstance(UserDto, items);
    return { items: usersDto, totalCount };
  }

  async userCreate(payload: UserCreateDto): Promise<UserDto> {
    const { username, nationalCode } = payload;

    await this.userRep.checkDuplicateBy({ where: { username } }, 'username', username);

    const defaultPassword = nationalCode;
    const hashedPassword = await this.passwordService.hashPassword(defaultPassword);

    const user = await this.userRep.create({ data: { ...payload, password: hashedPassword } });

    return plainToInstance(UserDto, user);
  }

  async userSetIsActive(userId: number, payload: UserSetActiveDto): Promise<void> {
    const { isActive } = payload;
    await this.userRep.findAndCheckExistsBy({ where: { id: userId } }, 'userId', userId);
    await this.userRep.update({ where: { id: userId }, data: { isActive } });
  }

  async userChangePassword(userId: number, payload: UserChangePasswordDto): Promise<void> {
    const user = await this.userRep.findAndCheckExistsBy({ where: { id: userId } }, 'id', userId);

    const validateResult = await this.passwordService.validatePassword(
      payload.currentPassword,
      user.password,
    );
    if (!validateResult) throw new ForbiddenException('passwords doesnt match');

    const hashedNewPassword = await this.passwordService.hashPassword(payload.newPassword);

    await this.userRep.update({ where: { id: userId }, data: { password: hashedNewPassword } });
  }
}
