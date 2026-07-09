import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { CandidateService } from './candidate.service';

@Controller('candidates')
export class CandidateController {
  constructor(private service: CandidateService) {}

  @Post()
  create(@Body() body: { jobOfferId: string; firstName: string; lastName: string; email: string; phone?: string; coverLetter?: string; resumeUrl?: string }) {
    return this.service.create(body);
  }

  @Get()
  findByJobOffer(@Query('jobOfferId') jobOfferId: string) {
    return this.service.findByJobOffer(jobOfferId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { status?: string; interviewDate?: Date; notes?: string }) {
    return this.service.update(id, body);
  }
}
