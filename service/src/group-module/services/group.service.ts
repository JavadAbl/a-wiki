import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { GroupCreateDto } from '../dto/request/group-create.dto';
import { GroupUpdateDto } from '../dto/request/group-update.dto';
import { GroupDto } from '../dto/response/group.dto';
import { GroupDetailsDto } from '../dto/response/group-details.dto';
import { GroupRepository } from '../repositories/group.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRep: GroupRepository,
    private readonly prisma: PrismaProvider,
  ) {}

  async groupGetMany(query: GetManyQueryType<'Group'>): Promise<GetManyReply<GroupDto>> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['name'] });
    const { items, totalCount } = await this.groupRep.findMany({
      ...predicate,
      orderBy: predicate.orderBy ?? [{ name: 'asc' }, { id: 'asc' }],
    });
    return { items: plainToInstance(GroupDto, items), totalCount };
  }

  async groupGetById(id: number): Promise<GroupDetailsDto> {
    const group = await this.groupRep.findAndCheckExistsBy(
      {
        where: { id },
        include: { courses: true, categories: true },
      },
      'id',
      id,
    );

    return plainToInstance(GroupDetailsDto, {
      id: group.id,
      name: group.name,
      description: group.description,
      courseIds: group.courses.map((c) => c.courseId),
      categoryIds: group.categories.map((c) => c.categoryId),
    });
  }

  async groupCreate(payload: GroupCreateDto): Promise<number> {
    await this.groupRep.checkDuplicateBy({ where: { name: payload.name } }, 'name', payload.name);
    const group = await this.groupRep.create({ data: payload });
    return group.id;
  }

  async groupUpdate(id: number, payload: GroupUpdateDto): Promise<void> {
    if (payload.name) {
      const existing = await this.groupRep.findFirst({ where: { name: payload.name } });
      if (existing && existing.id !== id)
        throw new BadRequestException(`group name with value ${payload.name} already exists`);
    }
    await this.groupRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.groupRep.update({ where: { id }, data: payload });
  }

  async groupDelete(id: number): Promise<void> {
    await this.groupRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.groupRep.remove({ where: { id } });
  }

  async groupSetCourses(id: number, courseIds: number[]): Promise<void> {
    await this.groupRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    const ids = await this.validateIds(courseIds, 'course');
    await this.prisma.$transaction([
      this.prisma.groupCourse.deleteMany({ where: { groupId: id } }),
      ...ids.map((courseId) =>
        this.prisma.groupCourse.create({ data: { groupId: id, courseId } }),
      ),
    ]);
  }

  async groupSetCategories(id: number, categoryIds: number[]): Promise<void> {
    await this.groupRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    const ids = await this.validateIds(categoryIds, 'category');
    await this.prisma.$transaction([
      this.prisma.groupCategory.deleteMany({ where: { groupId: id } }),
      ...ids.map((categoryId) =>
        this.prisma.groupCategory.create({ data: { groupId: id, categoryId } }),
      ),
    ]);
  }

  private async validateIds(ids: number[], model: 'course' | 'category'): Promise<number[]> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return unique;
    const count =
      model === 'course'
        ? await this.prisma.course.count({ where: { id: { in: unique } } })
        : await this.prisma.category.count({ where: { id: { in: unique } } });
    if (count !== unique.length)
      throw new BadRequestException(`One or more ${model} ids not found`);
    return unique;
  }
}
