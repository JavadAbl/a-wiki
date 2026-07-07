import { Injectable } from '@nestjs/common';
import { SectionRepository } from '../repositories/section.repository';
import { CourseRepository } from '../repositories/course.repository';
import { SectionSetDescriptionDto } from '../dto/request/section-set-description.dto';
import { SectionCreateDto } from '../dto/request/section-create.dto';

@Injectable()
export class SectionService {
  constructor(
    private readonly sectionRep: SectionRepository,
    private readonly courseRep: CourseRepository,
  ) {}

  async sectionCreate(courseId: number, payload: SectionCreateDto): Promise<number> {
    const { title } = payload;
    const course = await this.courseRep.findAndCheckExistsBy(
      {
        where: { id: courseId },
        include: { sections: { select: { sectionOrder: true }, orderBy: { sectionOrder: 'desc' }, take: 1 } },
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

    let sectionOrder = 0;
    const lastSection = course.sections?.[0]?.sectionOrder;
    if (lastSection != undefined) sectionOrder = lastSection + 1;

    const section = await this.sectionRep.create({
      data: { ...payload, sectionOrder, courseId },
      select: { id: true },
    });
    return section.id;
  }

  async sectionSetDescription(sectionId: number, payload: SectionSetDescriptionDto): Promise<void> {
    const { description } = payload;
    await this.sectionRep.findAndCheckExistsBy({ where: { id: sectionId } }, 'id', sectionId);

    await this.sectionRep.update({ where: { id: sectionId }, data: { description: description } });
  }
}
