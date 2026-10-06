import { Injectable } from '@nestjs/common';
import { LinkRepository } from '../repositories/link.repository';
import { LinkCreateDto } from '../dto/request/link-create.dto';
import { LinkUpdateDto } from '../dto/request/link-update.dto';
import { LinkDto } from '../dto/response/link.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LinkService {
  constructor(private readonly linkRep: LinkRepository) {}

  async linkGetMany(): Promise<LinkDto[]> {
    const links = await this.linkRep.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    return plainToInstance(LinkDto, links.items, { excludeExtraneousValues: true });
  }

  async linkCreate(payload: LinkCreateDto): Promise<number> {
    const link = await this.linkRep.create({ data: payload });
    return link.id;
  }

  async linkUpdate(linkId: number, payload: LinkUpdateDto): Promise<void> {
    await this.linkRep.findAndCheckExistsBy({ where: { id: linkId } }, 'id', linkId);
    await this.linkRep.update({ where: { id: linkId }, data: payload });
  }

  async linkDelete(linkId: number): Promise<void> {
    await this.linkRep.findAndCheckExistsBy({ where: { id: linkId } }, 'id', linkId);
    await this.linkRep.remove({ where: { id: linkId } });
  }
}