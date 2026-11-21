import { Module } from '@nestjs/common';
import { TenantRepository } from './repository/tenant.repository';
import { TenantService } from './services/tenant.service';
import { TenantController } from './controllers/tenant.controller';

@Module({
  controllers: [TenantController],
  providers: [TenantRepository, TenantService],
})
export class TenantModule {}
