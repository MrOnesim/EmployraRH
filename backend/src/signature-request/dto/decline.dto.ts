import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeclineDto {
  @ApiProperty({ example: 'Terms not acceptable' })
  @IsString()
  @MinLength(1)
  reason: string;
}
