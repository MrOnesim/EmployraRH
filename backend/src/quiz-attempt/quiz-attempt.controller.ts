import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { QuizAttemptService } from './quiz-attempt.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('quiz-attempts')
@ApiBearerAuth()
@Controller('quiz-attempts')
@UseGuards(RolesGuard)
export class QuizAttemptController {
  constructor(private service: QuizAttemptService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit answers and auto-calculate score' })
  submit(@Body() dto: SubmitQuizDto) {
    return this.service.submit(dto.quizId, dto.employeeId, dto.answers);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'Get attempts by quiz' })
  findByQuiz(@Param('quizId', ParseCuidPipe) quizId: string) {
    return this.service.findByQuiz(quizId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attempts by employee' })
  findByEmployee(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get attempts by course' })
  findByCourse(@Param('courseId', ParseCuidPipe) courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attempt by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }
}
