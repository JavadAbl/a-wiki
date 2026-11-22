import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'src/auth-module/contracts/token-service.contract';
import { Role } from 'src/auth-module/enums/role.enum';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

export interface AccessRestriction {
  courseIds: Set<number>;
  categoryIds: Set<number>;
}

type CourseLike = { id: number; categoryId?: number | null };

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaProvider) {}

  /// Returns null when no restriction applies (anonymous, admin, or user without a group).
  async resolveRestriction(context?: TokenPayload): Promise<AccessRestriction | null> {
    if (!context) return null;
    if (context.role === Role.Admin || context.role === Role.SuperAdmin) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: context.userId },
      select: { groupId: true },
    });
    if (!user?.groupId) return null;

    const [courses, categories] = await Promise.all([
      this.prisma.groupCourse.findMany({
        where: { groupId: user.groupId },
        select: { courseId: true },
      }),
      this.prisma.groupCategory.findMany({
        where: { groupId: user.groupId },
        select: { categoryId: true },
      }),
    ]);

    return {
      courseIds: new Set(courses.map((c) => c.courseId)),
      categoryIds: new Set(categories.map((c) => c.categoryId)),
    };
  }

  /// A course is allowed when its id is listed, or its category is listed.
  isCourseAllowed(restriction: AccessRestriction | null, course: CourseLike): boolean {
    if (!restriction) return true;
    return (
      restriction.courseIds.has(course.id) ||
      (course.categoryId != null && restriction.categoryIds.has(course.categoryId))
    );
  }

  /// Prisma `where` fragment for list queries; null means no extra filter.
  courseWhere(restriction: AccessRestriction | null): object | null {
    if (!restriction) return null;
    return {
      OR: [
        { id: { in: [...restriction.courseIds] } },
        { categoryId: { in: [...restriction.categoryIds] } },
      ],
    };
  }
}
