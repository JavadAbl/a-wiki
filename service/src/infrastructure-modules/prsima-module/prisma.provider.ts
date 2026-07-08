import { AppConfig, ConfigType } from '../../common/config/config.type';
import { ConfigService } from '@nestjs/config';
import { Injectable, Scope } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable({ scope: Scope.DEFAULT })
export class PrismaProvider extends PrismaClient {
  constructor(configService: ConfigService<ConfigType>) {
    const config = configService.getOrThrow<AppConfig>('app');

    const adapter = new PrismaBetterSqlite3({ url: config.DATABASE_URL });

    super({ adapter });
  }
}
