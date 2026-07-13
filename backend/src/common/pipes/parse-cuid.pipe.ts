import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const CUID_PATTERN = /^c[a-z0-9]{7,31}$/;

@Injectable()
export class ParseCuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string' || !CUID_PATTERN.test(value)) {
      throw new BadRequestException('Validation failed (cuid is expected)');
    }
    return value;
  }
}
