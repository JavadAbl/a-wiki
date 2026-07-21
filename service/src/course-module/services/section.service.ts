import { Injectable } from '@nestjs/common';
import { SectionRepository } from '../repositories/section.repository';
import { CourseRepository } from '../repositories/course.repository';
import { SectionSetDescriptionDto } from '../dto/request/section-set-description.dto';
import { SectionCreateDto } from '../dto/request/section-create.dto';
import { SectionUpdateDto } from '../dto/request/section-update.dto';
import { S3Provider } from 'src/infrastructure-modules/s3-module/s3.provider';

@Injectable()
export class SectionService {
  constructor(
    private readonly sectionRep: SectionRepository,
    private readonly courseRep: CourseRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async sectionCreate(courseId: number, payload: SectionCreateDto): Promise<number> {
    const { title } = payload;
    const course = await this.courseRep.findAndCheckExistsBy(
      {
        where: { id: courseId },
        include: { sections: { select: { order: true }, orderBy: { order: 'desc' }, take: 1 } },
      },
      'courseId',
      courseId,
    );
    await this.sectionRep.checkDuplicateBy(
      { where: { title, courseId } },
      null,
      null,
      'Section is already exists',
    );

    let order = 0;
    const lastSection = course.sections?.[0]?.order;
    if (lastSection != undefined) order = lastSection + 1;

    const section = await this.sectionRep.create({
      data: { ...payload, order, courseId },
      select: { id: true },
    });
    return section.id;
  }

  async sectionUpdate(sectionId: number, payload: SectionUpdateDto): Promise<void> {
    await this.sectionRep.findAndCheckExistsBy({ where: { id: sectionId } }, 'sectionId', sectionId);
    await this.sectionRep.update({ where: { id: sectionId }, data: payload });
  }

  async sectionSetDescription(sectionId: number, payload: SectionSetDescriptionDto): Promise<void> {
    const { description } = payload;
    await this.sectionRep.findAndCheckExistsBy({ where: { id: sectionId } }, 'id', sectionId);

    await this.sectionRep.update({ where: { id: sectionId }, data: { description: description } });
  }

  async sectionDelete(sectionId: number) {
    const section = await this.sectionRep.findAndCheckExistsBy(
      { where: { id: sectionId }, include: { course: true } },
      'sectionId',
      sectionId,
    );

    const courseId = section.course.id;

    const s3Key = ['courses', String(courseId), 'sections', String(sectionId)].join('/');

    await this.s3Provider.deletePrefix(s3Key);

    await this.sectionRep.remove({ where: { id: sectionId } });
  }
}
