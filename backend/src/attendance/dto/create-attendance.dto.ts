import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty()
  @IsString()
  qrToken: string;

  @ApiProperty()
  @IsString()
  guardId: string;

  @ApiProperty()
  @IsString()
  terminalId: string;

  @ApiProperty()
  @IsString()
  deviceFingerprint: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scanMethod?: string;
}
