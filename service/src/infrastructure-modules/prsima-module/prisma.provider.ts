import { AppConfig, ConfigType } from '../../common/config/config.type';
import { ConfigService } from '@nestjs/config';
import { Injectable, Scope } from '@nestjs/common';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from 'src/generated/prisma/client';
import { TenantContext } from '../../common/tenant/tenant-context';

/**
 * Models that carry a tenantId column. Every read on them is filtered by the
 * current tenant and every create is stamped with it. The remaining models
 * (Tenant, Permission, RolePermission, UserPermission) are global.
 */
const TENANT_SCOPED_MODELS = new Set([
  'user',
  'category',
  'link',
  'course',
  'document',
  'section',
  'part',
  'content',
  'favoriteCourse',
  'partView',
  'courseRelatedCourse',
]);

const CREATE_OPERATIONS = new Set(['create', 'createMany', 'createManyAndReturn']);
const UPSERT_OPERATIONS = new Set(['upsert']);

/**
 * Injects the tenant filter / stamp into the args of a tenant-scoped model.
 * Filtering always uses an AND wrapper so the tenant scope can never be
 * weakened (or replaced) by a caller-supplied where clause.
 */
function scopeArgs(operation: string, args: any, tenantId: number): any {
  if (args == null) return args;

  if (CREATE_OPERATIONS.has(operation)) {
    if (Array.isArray(args.data)) {
      args.data.forEach((row: any) => {
        if (row?.tenantId === undefined) row.tenantId = tenantId;
      });
    } else if (args.data?.tenantId === undefined) {
      args.data.tenantId = tenantId;
    }
    return args;
  }

  if (UPSERT_OPERATIONS.has(operation)) {
    args.where = scopeWhere(args.where, tenantId);
    if (args.create?.tenantId === undefined) args.create.tenantId = tenantId;
    return args;
  }

  if (args.where !== undefined) args.where = scopeWhere(args.where, tenantId);
  return args;
}

function scopeWhere(where: any, tenantId: number): any {
  // the request tenant is AND-ed with whatever the caller filtered on
  return { AND: [where ?? {}, { tenantId }] };
}

@Injectable({ scope: Scope.DEFAULT })
export class PrismaProvider extends PrismaClient {
  constructor(configService: ConfigService<ConfigType>, tenantContext: TenantContext) {
    const config = configService.getOrThrow<AppConfig>('app');

    // Use the MSSQL adapter
    const adapter = new PrismaMssql(config.DATABASE_URL, {
      onConnectionError: (err) => {
        console.log(err);
      },
    });

    super({ adapter });

    const xprisma = this.$extends({
      query: {
        $allModels: {
          $allOperations({ model, operation, args, query }) {
            if (model && TENANT_SCOPED_MODELS.has(model)) {
              const tenantId = tenantContext.tenantId;
              if (tenantId != null) args = scopeArgs(operation, args, tenantId);
            }
            return query(args);
          },
        },
      },
    });

    // $extends returns a new client; returning it from the constructor makes
    // the extended client THE instance consumers receive.
    return xprisma as unknown as PrismaProvider;
  }
}
