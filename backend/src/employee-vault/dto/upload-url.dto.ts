import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsString()
  filename: string;
}
