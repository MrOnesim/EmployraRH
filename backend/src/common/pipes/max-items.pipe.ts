import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const MAX_ITEMS = 100;

@Injectable()
export class MaxItemsPipe implements PipeTransform<number, number> {
  transform(value: any): number {
    const num = Number(value);
    if (isNaN(num) || num < 1) {
      return 10;
    }
    if (num > MAX_ITEMS) {
      throw new BadRequestException(
        `Items per page cannot exceed ${MAX_ITEMS}`,
      );
    }
    return num;
  }
}
