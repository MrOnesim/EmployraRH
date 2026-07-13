import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  companyId: string;

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
