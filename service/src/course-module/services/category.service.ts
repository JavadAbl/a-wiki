import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CategoryCreateDto } from '../dto/request/category-create.dto';
import { CategorySetOrdersDto } from '../dto/request/category-set-orders.dto';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { CategoryDto } from '../dto/response/category.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryUpdateDto } from '../dto/request/category-update.dto';
import { Prisma } from 'src/generated/prisma/client';
import type { CategoryOrderByWithRelationInput } from 'src/generated/prisma/models/Category';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRep: CategoryRepository) {}

  async categoryGetMany(query: GetManyQueryType<'Category'>): Promise<GetManyReply<CategoryDto>> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['name'] });

    // Default sort by order (then id) unless the query asked for a specific sort
    const defaultOrderBy: CategoryOrderByWithRelationInput[] = [
      { order: 'asc' },
      { id: 'asc' },
    ];
    const orderBy = predicate.orderBy ?? defaultOrderBy;

    const { items, totalCount } = await this.categoryRep.findMany({
      ...predicate,
      orderBy,
      where: { ...predicate.where },
    });
    return { items: items, totalCount };
  }

  async categorySetOrders(payload: CategorySetOrdersDto): Promise<void> {
    const { orders } = payload;

    const ids = orders.map((o) => o.id);
    const found = await this.categoryRep.count({ where: { id: { in: ids } } });
    if (found !== ids.length) {
      throw new BadRequestException('One or more categories not found');
    }

    const prisma = this.categoryRep.prismaClient;
    await prisma.$transaction(
      orders.map((o) =>
        prisma.category.update({ where: { id: o.id }, data: { order: o.order } }),
      ),
    );
  }

  async categoryCreate(payload: CategoryCreateDto): Promise<number> {
    const { name } = payload;

    await this.categoryRep.checkDuplicateBy({ where: { name } }, 'name', name);

    const category = await this.categoryRep.create({ data: payload });
    return category.id;
  }

  async categoryUpdate(id: number, payload: CategoryUpdateDto): Promise<void> {
    await this.categoryRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.categoryRep.update({ data: payload, where: { id } });
  }

  async categoryDelete(categoryId: number) {
    await this.categoryRep.findAndCheckExistsBy({ where: { id: categoryId } }, 'categoryId', categoryId);
    await this.categoryRep.remove({ where: { id: categoryId } });
  }
}