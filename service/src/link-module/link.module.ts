import { Module } from '@nestjs/common';
import { LinkRepository } from './repositories/link.repository';
import { LinkService } from './services/link.service';
import { LinkController } from './controllers/link.controller';

@Module({
  controllers: [LinkController],
  providers: [LinkRepository, LinkService],
})
export class LinkModule {}