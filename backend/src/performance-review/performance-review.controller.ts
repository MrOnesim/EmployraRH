import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { PerformanceReviewService } from './performance-review.service';

@Controller('performance-reviews')
export class PerformanceReviewController {
  constructor(private service: PerformanceReviewService) {}

  @Post()
  create(@Body() body: { employeeId: string; reviewerId: string; rating: number; feedback?: string; strengths?: string[]; improvements?: string[]; objectiveIds?: string[] }) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
