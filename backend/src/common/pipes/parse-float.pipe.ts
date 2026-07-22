import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFloatPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      throw new BadRequestException('Validation failed (numeric float is expected)');
    }
    return num;
  }
}
