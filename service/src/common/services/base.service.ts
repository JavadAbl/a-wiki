import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from 'src/generated/prisma/client';
import { Repository } from 'src/infrastructure-modules/prsima-module/base.repository';

@Injectable()
export class BaseService<E extends keyof PrismaClient, T extends Repository<E> = Repository<E>> {
  // Use `protected` so subclasses can access the repository if they need custom logic
  constructor(protected readonly repository: T) {}

  // --- READ ---

  findMany<TArgs extends Prisma.Args<PrismaClient[E], 'findMany'>>(args?: TArgs) {
    return this.repository.findMany(args);
  }

  findUnique<TArgs extends Prisma.Args<PrismaClient[E], 'findUnique'>>(args: TArgs) {
    return this.repository.findUnique(args);
  }

  findFirst<TArgs extends Prisma.Args<PrismaClient[E], 'findFirst'>>(args: TArgs) {
    return this.repository.findFirst(args);
  }

  findBy<TArgs extends Prisma.Args<PrismaClient[E], 'findFirst'>>(args: TArgs) {
    return this.repository.findBy(args);
  }

  findAndCheckExistsBy<TArgs extends Prisma.Args<PrismaClient[E], 'findFirst'>>(
    args: TArgs,
    fieldName: string,
    value: any,
  ) {
    return this.repository.findAndCheckExistsBy(args, fieldName, value);
  }

  checkDuplicateBy<TArgs extends Prisma.Args<PrismaClient[E], 'findFirst'>>(
    args: TArgs,
    fieldName: string,
    value: any,
  ) {
    return this.repository.checkDuplicateBy(args, fieldName, value);
  }

  // --- WRITE ---

  create<TArgs extends Prisma.Args<PrismaClient[E], 'create'>>(args: TArgs) {
    return this.repository.create(args);
  }

  update<TArgs extends Prisma.Args<PrismaClient[E], 'update'>>(args: TArgs) {
    return this.repository.update(args);
  }

  updateMany<TArgs extends Prisma.Args<PrismaClient[E], 'updateMany'>>(args: TArgs) {
    return this.repository.updateMany(args);
  }

  upsert<TArgs extends Prisma.Args<PrismaClient[E], 'upsert'>>(args: TArgs) {
    return this.repository.upsert(args);
  }

  remove<TArgs extends Prisma.Args<PrismaClient[E], 'delete'>>(args: TArgs) {
    return this.repository.remove(args);
  }
}
