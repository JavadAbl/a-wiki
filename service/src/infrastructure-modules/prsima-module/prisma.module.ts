import { Global, Module } from '@nestjs/common';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Global()
@Module({ imports: [], providers: [PrismaProvider], exports: [PrismaProvider] })
export class PrismaModule {}
