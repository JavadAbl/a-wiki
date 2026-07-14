import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentCreateDto } from '../dto/request/document-create.dto';
import { CourseRepository } from '../repositories/course.repository';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRep: DocumentRepository,
    private readonly courseRep: CourseRepository,
  ) {}

  async documentCreate(
    courseId: number,
    payload: DocumentCreateDto,
    file: Express.Multer.File,
  ): Promise<number> {
    return 1;
  }
}
