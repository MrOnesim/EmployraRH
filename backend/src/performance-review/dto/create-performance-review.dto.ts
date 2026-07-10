import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePerformanceReviewDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsString()
  reviewerId: string;

  @ApiProperty()
  @IsNumber()
  rating: number;

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
}
