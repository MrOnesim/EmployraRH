import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private service: QuizService) {}

  @Post()
  create(@Body() body: { courseId: string; title: string; description?: string; passingScore?: number; timeLimit?: number; questions?: any }) {
    return this.service.create(body);
  }

  @Get()
  findByCourse(@Query('courseId') courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
