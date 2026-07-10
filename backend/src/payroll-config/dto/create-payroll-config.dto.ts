import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayrollConfigDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiPropertyOptional({ default: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: 0.15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  taxRate?: number;

  @ApiPropertyOptional({ default: 0.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  socialChargesRate?: number;

  @ApiPropertyOptional({ default: 28 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  paymentDay?: number;

  @ApiPropertyOptional({ default: 1.25 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  overtimeRate?: number;
}
