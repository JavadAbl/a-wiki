import { BadRequestException, Inject, Injectable, Type, UnauthorizedException } from '@nestjs/common';
import {
  generateActionPermissionName,
  generateControllerPermissionName,
  SERVICE_PERMISSION,
} from '../auth.utils';
import { PermissionType, Role } from 'src/generated/prisma/enums';
import { AuthRepository } from '../repositories/auth.repository';
import { ITokenService } from '../contracts/token-service.contract';
import { LoginDto } from '../dto/request/login.dto';
import { IUserServiceContract } from 'src/user-module/contracts/user-service.contract';
import { PasswordService } from 'src/common/services/password.service';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/user-module/dto/response/user.dto';
import { AuthDto } from '../dto/response/auth.dto';
import { RolePermissionCreateDto } from '../dto/request/role-permission-create.dto';
import { UserPermissionCreateDto } from '../dto/request/user-permission-create.dto';

@Injectable()
export class AuthService {
  private APP_PERMISSIONS: { name: string; type: PermissionType }[] = [
    { type: PermissionType.Service, name: SERVICE_PERMISSION },
  ];

  constructor(
    private readonly authRep: AuthRepository,
    private readonly passwordService: PasswordService,
    @Inject(ITokenService) private readonly tokenService: ITokenService,
    @Inject(IUserServiceContract) private readonly userService: IUserServiceContract,
  ) {}

  async login(payload: LoginDto): Promise<AuthDto> {
    const { password, username } = payload;

    const user = await this.userService.userGetByUsername(username);
    if (!user) throw new UnauthorizedException('Incorrect username or password');

    const validateResult = await this.passwordService.validatePassword(password, user.password);
    if (!validateResult) throw new UnauthorizedException('Incorrect username or password');

    const { accessToken, refreshToken } = await this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      permissions: user.userPermissions.map((up) => up.permission.name),
    });

    const userDto = plainToInstance(UserDto, user);
    return { user: userDto, refreshToken, accessToken };
  }

  //Permission-----------------------------------------------
  async setupPermissions(): Promise<void> {
    await this.authRep.syncPermissions(this.APP_PERMISSIONS);
  }

  addControllerPermissions<T>(controller: Type<T>): void {
    this.APP_PERMISSIONS.push({
      type: PermissionType.Controller,
      name: generateControllerPermissionName(controller.name),
    });

    Object.getOwnPropertyNames(controller.prototype)
      .filter((name) => name !== 'constructor' && typeof controller.prototype[name] === 'function')
      .forEach((method) =>
        this.APP_PERMISSIONS.push({
          type: PermissionType.Action,
          name: generateActionPermissionName(controller.name, method),
        }),
      );
  }

  //RolePermission-----------------------------------------------
  async rolePermissionCreate(payload: RolePermissionCreateDto): Promise<void> {
    const { permissionId, role } = payload;
    const permission = await this.authRep.permissionFindById(permissionId);

    if (!permission) throw new BadRequestException('Invalid permission');

    await this.authRep.rolePermissionCreate({
      data: { permissionId, role, permissionName: permission.name },
    });
  }

  async rolePermissionDelete(id: number): Promise<void> {
    await this.authRep.rolePermissionDelete({ where: { id } });
  }

  rolePermissionFindByRoleAndPermissionName(role: Role, permissionName: string) {
    return this.authRep.rolePermissionFindFirst({
      where: { role, permissionName: { contains: permissionName } },
    });
  }

  //UserPermission-----------------------------------------------
  async userPermissionCreate(payload: UserPermissionCreateDto): Promise<void> {
    const { userId, permissionId } = payload;

    const permission = await this.authRep.permissionFindById(permissionId);
    if (!permission) throw new BadRequestException('Invalid permission');

    const user = await this.userService.userGetById(userId);
    if (!user) throw new BadRequestException('Invalid user');

    await this.authRep.userPermissionCreate({ data: { userId, permissionId } });
  }

  async userPermissionDelete(id: number): Promise<void> {
    await this.authRep.userPermissionDelete({ where: { id } });
  }
}
