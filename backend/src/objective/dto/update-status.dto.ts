import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateObjectiveStatusDto {
  @ApiProperty({ example: 'submitted', enum: ['draft', 'submitted', 'acknowledged'] })
  @IsString()
  @IsIn(['draft', 'submitted', 'acknowledged'])
  status: string;
}
