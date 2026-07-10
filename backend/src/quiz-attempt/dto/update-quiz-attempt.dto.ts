import { IsString, IsOptional, IsNumber, IsBoolean, IsObject, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuizAttemptDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalPoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  answers?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
