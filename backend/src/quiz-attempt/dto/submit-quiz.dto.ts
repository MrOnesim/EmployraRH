import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty()
  @IsString()
  quizId: string;

  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  answers: number[];
}
