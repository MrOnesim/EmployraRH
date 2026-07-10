import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttendanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  clockIn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  clockOut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  breakStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  breakEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
