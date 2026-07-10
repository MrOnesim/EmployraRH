import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePayslipDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(2020)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grossSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  netSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
