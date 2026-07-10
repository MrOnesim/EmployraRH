import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSalaryAdvanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  approvedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paidAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  repaymentDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  repaymentAmount?: number;
}
