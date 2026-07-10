import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScanAttendanceDto {
  @ApiProperty()
  @IsString()
  guardId: string;

  @ApiProperty()
  @IsString()
  employeeId: string;
}
