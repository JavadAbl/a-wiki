import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure-modules/prsima-module/prisma.module';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaModule],
})
export class AppModule {}
