import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  signature?: string;
}
