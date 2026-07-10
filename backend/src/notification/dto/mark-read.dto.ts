import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MarkReadDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  userId: string;
}
