import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/common/config/config.type';
import { Role } from 'src/generated/prisma/enums';
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import { UserChangePasswordOtpDto } from '../dto/request/user-change-password-otp.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRep: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService<AppConfig>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async userGetById(id: number): Promise<UserDto> {
    const user = await this.userRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    return plainToInstance(UserDto, user);
  }

  async userGetMany(query: GetManyQueryType<'User'>): Promise<GetManyReply<UserDto>> {
    const predicate = buildFindManyArgs(query, {
      searchableFields: ['firstName', 'lastName', 'username', 'mobile'],
    });
    const { items, totalCount } = await this.userRep.findMany(predicate);
    const usersDto = plainToInstance(UserDto, items);
    return { items: usersDto, totalCount };
  }

  async userCreate(payload: UserCreateDto): Promise<UserDto> {
    const { username, mobile } = payload;

    await this.userRep.checkDuplicateBy({ where: { username } }, 'username', username);

    const defaultPassword = mobile;
    const hashedPassword = await this.passwordService.hashPassword(defaultPassword);

    const user = await this.userRep.create({ data: { ...payload, password: hashedPassword } });

    return plainToInstance(UserDto, user);
  }

  async superAdminCreate(seedPass: string): Promise<void> {
    if (seedPass != this.configService.getOrThrow('SUPER_ADMIN_SEED_PASSWORD'))
      throw new UnauthorizedException();

    const username = this.configService.getOrThrow<string>('SUPER_ADMIN_USERNAME');
    const mobile = this.configService.getOrThrow<string>('SUPER_ADMIN_MOBILE');
    const defaultPassword = this.configService.getOrThrow<string>('SUPER_ADMIN_PASSWORD');

    await this.userRep.checkDuplicateBy({ where: { username } }, 'username', username);

    const hashedPassword = await this.passwordService.hashPassword(defaultPassword);

    await this.userRep.create({
      data: {
        firstName: 'sa',
        lastName: 'sa',
        mobile,
        username,
        role: Role.SuperAdmin,
        password: hashedPassword,
      },
    });
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

  async userChangePasswordOtp(payload: UserChangePasswordOtpDto): Promise<void> {
    const { newPassword, otp, mobile } = payload;

    const cachedOtp = await this.cacheManager.get(`otp-${mobile}`);
    if (cachedOtp != otp) throw new UnauthorizedException('Incorrect otp code');

    const user = await this.userRep.findAndCheckExistsBy({ where: { mobile } }, 'mobile', mobile);

    const hashedNewPassword = await this.passwordService.hashPassword(newPassword);

    await this.userRep.update({ where: { id: user.id }, data: { password: hashedNewPassword } });
  }
}
