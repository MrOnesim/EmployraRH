import { IsString, IsOptional, IsNumber, IsArray, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePerformanceReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  strengths?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  improvements?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  objectiveIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reviewDate?: Date;
}
