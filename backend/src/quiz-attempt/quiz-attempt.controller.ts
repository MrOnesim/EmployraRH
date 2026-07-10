import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('quiz-attempts')
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
  findByQuiz(@Param('quizId', ParseUUIDPipe) quizId: string) {
    return this.service.findByQuiz(quizId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attempts by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get attempts by course' })
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attempt by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }
}
