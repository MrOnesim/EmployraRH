import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveAdvanceDto {
  @ApiProperty()
  @IsString()
  approvedBy: string;
}
