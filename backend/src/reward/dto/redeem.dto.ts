import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsString()
  catalogId: string;
}
