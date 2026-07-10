import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReceiptExpenseDto {
  @ApiProperty()
  @IsString()
  url: string;
}
