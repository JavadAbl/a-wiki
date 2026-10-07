import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { LinkRepository } from '../repositories/link.repository';
import { LinkCreateDto } from '../dto/request/link-create.dto';
import { LinkUpdateDto } from '../dto/request/link-update.dto';
import { LinkSetOrdersDto } from '../dto/request/link-set-orders.dto';
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

  async linkSetOrders(payload: LinkSetOrdersDto): Promise<void> {
    const { orders } = payload;

    const ids = orders.map((o) => o.id);
    const found = await this.linkRep.count({ where: { id: { in: ids } } });
    if (found !== ids.length) {
      throw new BadRequestException('One or more links not found');
    }

    const prisma = this.linkRep.prismaClient;
    await prisma.$transaction(
      orders.map((o) =>
        prisma.link.update({ where: { id: o.id }, data: { order: o.order } }),
      ),
    );
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