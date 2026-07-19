import { Injectable } from '@nestjs/common';
import { PartRepository } from '../repositories/part.repository';
import { SectionRepository } from '../repositories/section.repository';
import { PartCreateDto } from '../dto/request/part-create.dto';
import { PartSetDescriptionDto } from '../dto/request/part-set-description.dto';
import { join } from 'path';
import { rm } from 'fs/promises';
import { PartViewRepository } from '../repositories/part-view.repository';

@Injectable()
export class PartService {
  constructor(
    private readonly partRep: PartRepository,
    private readonly partViewRep: PartViewRepository,
    private readonly sectionRep: SectionRepository,
  ) {}

  async partCreate(sectionId: number, payload: PartCreateDto): Promise<number> {
    const { title } = payload;
    const course = await this.sectionRep.findAndCheckExistsBy(
      {
        where: { id: sectionId },
        include: { parts: { select: { order: true }, orderBy: { order: 'desc' }, take: 1 } },
      },
      'sectionId',
      sectionId,
    );
    await this.partRep.checkDuplicateBy(
      { where: { title, sectionId } },
      null,
      null,
      'Part is already exists',
    );

    let order = 0;
    const lastPart = course.parts?.[0]?.order;
    if (lastPart != undefined) order = lastPart + 1;

    const part = await this.partRep.create({ data: { ...payload, order, sectionId }, select: { id: true } });
    return part.id;
  }

  async partSetDescription(partId: number, payload: PartSetDescriptionDto): Promise<void> {
    const { description } = payload;
    await this.partRep.findAndCheckExistsBy({ where: { id: partId } }, 'id', partId);

    await this.partRep.update({ where: { id: partId }, data: { description: description } });
  }

  async partDelete(partId: number): Promise<void> {
    // Fetch the part with its relations so we can build the file system path
    const part = await this.partRep.findAndCheckExistsBy(
      { where: { id: partId }, include: { section: { include: { course: true } } } },
      'partId',
      partId,
    );

    const courseId = part.section.course.id;
    const sectionId = part.section.id;

    // Construct the base directory for this specific part
    const partDir = join(
      process.cwd(),
      'files',
      'courses',
      `${courseId}`,
      'sections',
      `${sectionId}`,
      'parts',
      `${partId}`,
    );

    // Delete the entire directory for this part (removes both 'videos' and 'sounds' subdirectories)
    // `recursive: true` ensures all nested files are deleted
    // `force: true` prevents the app from crashing if the directory was already deleted or never created
    await rm(partDir, { recursive: true, force: true });

    // Finally, remove the database record
    await this.partRep.remove({ where: { id: partId } });
  }

  async partSetView(partId: number, userId: number): Promise<void> {
    const existingView = await this.partViewRep.findUnique({ where: { userId_partId: { partId, userId } } });
    if (existingView) return;
    await this.partRep.findAndCheckExistsBy({ where: { id: partId } }, 'partId', partId);
    await this.partViewRep.create({ data: { userId, partId } });
  }
}
