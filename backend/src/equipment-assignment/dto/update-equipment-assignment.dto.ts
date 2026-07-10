import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEquipmentAssignmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditionAtReturn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  returnedAt?: Date;
}
