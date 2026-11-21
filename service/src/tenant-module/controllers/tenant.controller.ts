import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { SA } from 'src/common/decorators/sa.decorator';
import { TenantService } from '../services/tenant.service';
import { TenantCreateDto } from '../dto/request/tenant-create.dto';
import { TenantUpdateDto } from '../dto/request/tenant-update.dto';
import { TenantSetActiveDto } from '../dto/request/tenant-set-active.dto';
import { TenantDto, TenantPublicDto } from '../dto/response/tenant.dto';

@Controller('Tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /// public list shown on the instance-selection screen
  @Public()
  @Get()
  tenantGetManyPublic(): Promise<TenantPublicDto[]> {
    return this.tenantService.tenantGetManyPublic();
  }

  /// full list (incl. inactive) for the SuperAdmin panel
  @SA()
  @Get('All')
  tenantGetMany(): Promise<TenantDto[]> {
    return this.tenantService.tenantGetMany();
  }

  @SA()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  tenantCreate(@Body() payload: TenantCreateDto): Promise<number> {
    return this.tenantService.tenantCreate(payload);
  }

  @SA()
  @Patch(':id')
  tenantUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: TenantUpdateDto,
  ): Promise<void> {
    return this.tenantService.tenantUpdate(id, payload);
  }

  // Must stay declared before @Patch(':id') so 'Active' is not captured as an id
  @SA()
  @Patch(':id/Active')
  tenantSetActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: TenantSetActiveDto,
  ): Promise<void> {
    return this.tenantService.tenantSetActive(id, payload.isActive);
  }

  @SA()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  tenantDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tenantService.tenantDelete(id);
  }
}
