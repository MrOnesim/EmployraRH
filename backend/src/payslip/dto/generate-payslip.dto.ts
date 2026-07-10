import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePayslipDto {
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
}
