import { IsBoolean } from 'class-validator';

export class TenantSetActiveDto {
  @IsBoolean()
  isActive: boolean;
}
