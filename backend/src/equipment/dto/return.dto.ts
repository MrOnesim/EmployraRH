import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReturnEquipmentDto {
  @ApiProperty({ example: 'Good' })
  @IsString()
  conditionAtReturn: string;
}
