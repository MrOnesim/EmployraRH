import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('quiz-attempts')
@Controller('quiz-attempts')
export class QuizAttemptController {
  constructor(private service: QuizAttemptService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit answers and auto-calculate score' })
  submit(@Body() dto: SubmitQuizDto) {
    return this.service.submit(dto.quizId, dto.employeeId, dto.answers);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'Get attempts by quiz' })
  findByQuiz(@Param('quizId') quizId: string) {
    return this.service.findByQuiz(quizId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attempts by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get attempts by course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attempt by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
