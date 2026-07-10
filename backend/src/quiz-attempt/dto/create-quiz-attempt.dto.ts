import { IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizAttemptDto {
  @ApiProperty()
  @IsString()
  quizId: string;

  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsNumber()
  score: number;

  @ApiProperty()
  @IsNumber()
  totalPoints: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  answers?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  passed?: boolean;
}
