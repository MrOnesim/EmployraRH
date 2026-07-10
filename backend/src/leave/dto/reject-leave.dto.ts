import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectLeaveDto {
  @ApiProperty()
  @IsString()
  comment: string;
}
