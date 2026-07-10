import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApproveExpenseDto {
  @ApiProperty()
  @IsString()
  approvedBy: string;
}
