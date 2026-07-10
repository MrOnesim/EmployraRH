import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: ['invitation', 'payment', 'leave', 'attendance', 'payslip', 'recruitment', 'objective', 'review', 'contract', 'document'] })
  @IsString()
  @IsIn(['invitation', 'payment', 'leave', 'attendance', 'payslip', 'recruitment', 'objective', 'review', 'contract', 'document'])
  type: string;
}
