import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayslipDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  year: number;

  @ApiProperty()
  @IsNumber()
  grossSalary: number;

  @ApiProperty()
  @IsNumber()
  netSalary: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
