import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { WellnessSurveyService } from './wellness-survey.service';

@Controller('wellness-surveys')
export class WellnessSurveyController {
  constructor(private service: WellnessSurveyService) {}

  @Post()
  create(@Body() body: { title: string; description?: string; questions?: any; expiresAt?: Date; companyId: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
