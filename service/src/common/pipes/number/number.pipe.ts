import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NumberPipe implements PipeTransform {
  transform(value: any) {
    if (value === null || value === undefined || value === '') {
      throw new BadRequestException('Value must be a valid number');
    }

    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      throw new BadRequestException('Value must be a valid number');
    }

    return numValue;
  }
}
