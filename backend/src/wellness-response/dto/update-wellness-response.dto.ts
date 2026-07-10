import { IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWellnessResponseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  answers?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;
}
