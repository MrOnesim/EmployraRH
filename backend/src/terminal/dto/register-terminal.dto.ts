import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTerminalDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  deviceFingerprint: string;

  @ApiProperty()
  @IsString()
  companyId: string;
}
