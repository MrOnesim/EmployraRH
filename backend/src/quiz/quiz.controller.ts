import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private service: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  create(@Body() dto: CreateQuizDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get quizzes by course' })
  findByCourse(@Query('courseId') courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID with attempt count' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz' })
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.service.update(id, dto);
  }
}
