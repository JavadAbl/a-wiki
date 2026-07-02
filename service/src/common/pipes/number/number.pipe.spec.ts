import { BadRequestException } from '@nestjs/common';
import { NumberPipe } from './number.pipe';

describe('NumberPipe', () => {
  const pipe = new NumberPipe();
  it('should be defined', () => {
    expect(new NumberPipe()).toBeDefined();
  });

  it('should format number with default options', () => {
    expect(pipe.transform(12)).toBe(12);
    expect(pipe.transform('12')).toBe(12);
    expect(pipe.transform(1)).toBe(1);
    expect(pipe.transform(-1)).toBe(-1);
    expect(() => pipe.transform('abc')).toThrow(BadRequestException);
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
    expect(() => pipe.transform(null)).toThrow(BadRequestException);
  });
});
