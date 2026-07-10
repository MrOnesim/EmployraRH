import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdatePlaceholdersDto {
  @ApiProperty({ example: { name: 'John Doe', date: '2026-01-01' } })
  @IsObject()
  placeholders: Record<string, string>;
}
