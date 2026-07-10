import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaxDeclarationDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsNumber()
  @Min(2000)
  year: number;

  @ApiProperty()
  @IsString()
  taxType: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  taxableIncome: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  taxWithheld: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  declarationDate?: Date;

  @ApiProperty()
  @IsDateString()
  dueDate: Date;

  @ApiPropertyOptional({ default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
