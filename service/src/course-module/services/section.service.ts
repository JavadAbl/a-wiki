import { Injectable } from '@nestjs/common';
import { SectionRepository } from '../repositories/section.repository';
import { CourseRepository } from '../repositories/course.repository';
import { SectionSetDescriptionDto } from '../dto/request/section-set-description.dto';
import { SectionCreateDto } from '../dto/request/section-create.dto';
import { join } from 'path';
import { rm } from 'fs/promises';

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

  async sectionDelete(sectionId: number) {
    // Fetch the part with its relations so we can build the file system path
    const section = await this.sectionRep.findAndCheckExistsBy(
      { where: { id: sectionId }, include: { course: true } },
      'sectionId',
      sectionId,
    );

    const courseId = section.course.id;

    // Construct the base directory for this specific part
    const partDir = join(process.cwd(), 'files', 'courses', `${courseId}`, 'sections', `${sectionId}`);

    // Delete the entire directory for this part (removes both 'videos' and 'sounds' subdirectories)
    // `recursive: true` ensures all nested files are deleted
    // `force: true` prevents the app from crashing if the directory was already deleted or never created
    await rm(partDir, { recursive: true, force: true });

    // Finally, remove the database record
    await this.sectionRep.remove({ where: { id: sectionId } });
  }
}
