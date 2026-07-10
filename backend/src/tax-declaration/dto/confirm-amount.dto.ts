import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ConfirmAmountDto {
  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  amount: number;
}
