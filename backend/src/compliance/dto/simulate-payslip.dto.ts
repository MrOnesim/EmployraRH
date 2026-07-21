import { IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimulatePayslipDto {
  @ApiProperty({ example: 500000, description: 'Gross salary before deductions' })
  @IsNumber()
  @Min(0)
  grossSalary: number;

  @ApiProperty({ example: 'FR', description: 'ISO 3166-1 alpha-2 country code' })
  @IsString()
  @IsIn(['FR', 'BJ', 'CI', 'SN'])
  countryCode: string;

  @ApiProperty({ example: 7, description: 'Month (1-12)' })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026, description: 'Year' })
  @IsNumber()
  @Min(2020)
  @Max(2100)
  year: number;
}
