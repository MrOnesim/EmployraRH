import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcknowledgeReviewDto {
  @ApiProperty()
  @IsString()
  employeeId: string;
}
