import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class ThumbnailRepository extends Repository<'thumbnail'> {
  constructor(prismaProvider: PrismaProvider) {
    super('thumbnail', prismaProvider);
  }
}
