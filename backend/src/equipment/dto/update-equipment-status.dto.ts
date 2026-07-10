import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateEquipmentStatusDto {
  @ApiProperty({ example: 'assigned', enum: ['available', 'assigned', 'maintenance', 'retired'] })
  @IsString()
  @IsIn(['available', 'assigned', 'maintenance', 'retired'])
  status: string;
}
