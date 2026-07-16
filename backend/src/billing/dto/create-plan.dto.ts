import { IsBoolean, IsInt, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false, default: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, default: 'month' })
  @IsOptional()
  @IsString()
  interval?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  features?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  taxExempt?: boolean;
}
