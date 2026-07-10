import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateCandidateStatusDto {
  @ApiProperty({ example: 'accepted', enum: ['pending', 'accepted', 'rejected', 'withdrawn'] })
  @IsString()
  @IsIn(['pending', 'accepted', 'rejected', 'withdrawn'])
  status: string;
}
