import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  authorId: string;

  @ApiProperty()
  @IsString()
  authorName: string;

  @ApiProperty()
  @IsString()
  content: string;
}
