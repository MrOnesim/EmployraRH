import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignEquipmentDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'Good' })
  @IsString()
  conditionAtAssignment: string;
}
