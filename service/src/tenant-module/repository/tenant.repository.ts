import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class TenantRepository extends Repository<'tenant'> {
  constructor(prismaProvider: PrismaProvider) {
    super('tenant', prismaProvider);
  }
}
