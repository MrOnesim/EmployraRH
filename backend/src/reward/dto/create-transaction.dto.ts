import { IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsNumber()
  points: number;

  @ApiProperty({ enum: ['earned', 'redeemed'] })
  @IsIn(['earned', 'redeemed'])
  type: string;

  @ApiProperty()
  @IsString()
  reason: string;
}
