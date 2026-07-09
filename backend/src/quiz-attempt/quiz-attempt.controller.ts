import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';

@Controller('quiz-attempts')
export class QuizAttemptController {
  constructor(private service: QuizAttemptService) {}

  @Post()
  create(@Body() body: { quizId: string; employeeId: string; score: number; totalPoints: number; answers?: any; passed?: boolean }) {
    return this.service.create(body);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
