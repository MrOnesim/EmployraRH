import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private service: EnrollmentService) {}

  @Post()
  create(@Body() body: { employeeId: string; courseId: string }) {
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
  update(@Param('id') id: string, @Body() body: { progress?: number; completedLessons?: string[]; status?: string; completedAt?: Date }) {
    return this.service.update(id, body);
  }
}
