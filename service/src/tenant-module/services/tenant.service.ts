import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TenantRepository } from '../repository/tenant.repository';
import { TenantCreateDto } from '../dto/request/tenant-create.dto';
import { TenantUpdateDto } from '../dto/request/tenant-update.dto';
import { TenantDto, TenantPublicDto } from '../dto/response/tenant.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TenantService {
  constructor(private readonly tenantRep: TenantRepository) {}

  /// instances shown on the public selection screen
  async tenantGetManyPublic(): Promise<TenantPublicDto[]> {
    const tenants = await this.tenantRep.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    return plainToInstance(TenantPublicDto, tenants.items, { excludeExtraneousValues: true });
  }

  /// full list for the SuperAdmin panel (includes inactive instances)
  async tenantGetMany(): Promise<TenantDto[]> {
    const tenants = await this.tenantRep.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    return plainToInstance(TenantDto, tenants.items, { excludeExtraneousValues: true });
  }

  async tenantGetById(id: number): Promise<TenantDto> {
    const tenant = await this.tenantRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    return plainToInstance(TenantDto, tenant, { excludeExtraneousValues: true });
  }

  async tenantCreate(payload: TenantCreateDto): Promise<number> {
    await this.checkSlugFree(payload.slug);

    const tenant = await this.tenantRep.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        logoUrl: payload.logoUrl,
        order: payload.order ?? 0,
        isActive: payload.isActive ?? true,
      },
    });

    return tenant.id;
  }

  async tenantUpdate(id: number, payload: TenantUpdateDto): Promise<void> {
    const tenant = await this.tenantRep.findAndCheckExistsBy({ where: { id } }, 'id', id);

    if (payload.slug != null && payload.slug !== tenant.slug) {
      await this.checkSlugFree(payload.slug);
    }

    await this.tenantRep.update({ where: { id }, data: payload });
  }

  async tenantSetActive(id: number, isActive: boolean): Promise<void> {
    await this.tenantRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.tenantRep.update({ where: { id }, data: { isActive } });
  }

  async tenantDelete(id: number): Promise<void> {
    const tenant = await this.tenantRep.findAndCheckExistsBy({ where: { id } }, 'id', id);

    if (tenant.slug === 'default') {
      throw new BadRequestException('حذف نمونه پیش‌فرض مجاز نیست');
    }

    const counts = await this.tenantRep.prismaClient.$transaction([
      this.tenantRep.prismaClient.user.count({ where: { tenantId: id } }),
      this.tenantRep.prismaClient.course.count({ where: { tenantId: id } }),
      this.tenantRep.prismaClient.category.count({ where: { tenantId: id } }),
      this.tenantRep.prismaClient.link.count({ where: { tenantId: id } }),
    ]);

    if (counts.some((c) => c > 0)) {
      throw new ConflictException('نمونه دارای کاربر یا محتوا است؛ ابتدا محتوای آن را حذف کنید');
    }

    await this.tenantRep.remove({ where: { id } });
  }

  private async checkSlugFree(slug: string): Promise<void> {
    const existing = await this.tenantRep.findFirst({ where: { slug } });
    if (existing) {
      throw new ConflictException(`نمونه‌ای با شناسه «${slug}» از قبل وجود دارد`);
    }
  }
}
