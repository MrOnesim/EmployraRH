import { IsString, IsOptional, IsNumber, IsArray, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  progress?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  completedLessons?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
