import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class CategoryRepository extends Repository<'category'> {
  constructor(prismaProvider: PrismaProvider) {
    super('category', prismaProvider);
  }
}
