import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;
}
