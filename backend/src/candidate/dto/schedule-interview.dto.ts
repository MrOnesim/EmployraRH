import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ScheduleInterviewDto {
  @ApiProperty({ example: '2026-08-15T10:00:00.000Z' })
  @IsDateString()
  interviewDate: Date;
}
