import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubmitExpenseDto {
  @ApiProperty()
  @IsString()
  expenseReportId: string;
}
