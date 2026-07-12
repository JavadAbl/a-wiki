import { Injectable } from '@nestjs/common';
import { CategoryCreateDto } from '../dto/request/category-create.dto';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { CategoryDto } from '../dto/response/category.dto';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRep: CategoryRepository) {}

  async categoryGetMany(query: GetManyQueryType<'Category'>): Promise<GetManyReply<CategoryDto>> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['name'] });
    const { items, totalCount } = await this.categoryRep.findMany({
      ...predicate,
      where: { ...predicate.where },
    });
    return { items: items as any, totalCount };
  }

  async categoryCreate(payload: CategoryCreateDto): Promise<number> {
    const { name } = payload;

    await this.categoryRep.checkDuplicateBy({ where: { name } }, 'name', name);

    const category = await this.categoryRep.create({ data: payload });
    return category.id;
  }

  async categoryDelete(categoryId: number) {
    await this.categoryRep.findAndCheckExistsBy({ where: { id: categoryId } }, 'categoryId', categoryId);
    await this.categoryRep.remove({ where: { id: categoryId } });
  }
}
