import { IsString, IsNumber, Min, Max, IsIn, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SimulatePdfParamsDto {
  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code' })
  @IsString()
  @Length(2, 2)
  @IsIn(['FR', 'BJ', 'CI', 'SN'])
  countryCode: string;

  @ApiProperty({ description: 'Gross salary amount' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  grossSalary: number;

  @ApiProperty({ description: 'Month (1-12)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Year' })
  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  @Max(2100)
  year: number;
}
