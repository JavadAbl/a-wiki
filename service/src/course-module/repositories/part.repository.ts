import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class PartRepository extends Repository<'part'> {
  constructor(prismaProvider: PrismaProvider) {
    super('part', prismaProvider);
  }
}
