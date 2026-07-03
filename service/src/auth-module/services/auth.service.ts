import { Inject, Injectable, Type, UnauthorizedException } from '@nestjs/common';
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

  async createRolePermission(rolePermissionEvent: RolePermissionCreateDto): Promise<void> {
    const { permissionName, role } = rolePermissionEvent;
    await this.authRep.createRolePermission({ data: { permissionName, role } });
  }

  async deleteRolePermission(id: number): Promise<void> {
    await this.authRep.deleteRolePermission({ where: { id } });
  }

  findIncludedRolePermission(role: Role, permissionName: string) {
    return this.authRep.findFirstRolePermission({
      where: { role, permissionName: { contains: permissionName } },
    });
  }
}
