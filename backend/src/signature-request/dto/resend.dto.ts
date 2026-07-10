import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendDto {
  @ApiProperty({ example: 'recipient@example.com' })
  @IsEmail()
  recipientEmail: string;
}
