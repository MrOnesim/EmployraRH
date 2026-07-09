import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WellnessResponseService } from './wellness-response.service';

@Controller('wellness-responses')
export class WellnessResponseController {
  constructor(private service: WellnessResponseService) {}

  @Post()
  create(@Body() body: { surveyId: string; employeeId: string; answers?: any; anonymous?: boolean }) {
    return this.service.create(body);
  }

  @Get()
  findBySurvey(@Query('surveyId') surveyId: string) {
    return this.service.findBySurvey(surveyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
