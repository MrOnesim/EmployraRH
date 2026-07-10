import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSignatureRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  completedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  recipients?: any;
}
