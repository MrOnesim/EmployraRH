import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompleteMissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  report?: string;
}
