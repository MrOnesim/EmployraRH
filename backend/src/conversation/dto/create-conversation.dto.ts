import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty()
  @IsString()
  participantId: string;

  @ApiProperty()
  @IsString()
  participantName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  participantPosition?: string;

  @ApiProperty()
  @IsString()
  companyId: string;
}
