import { Controller, Get, Post, Body, Param, Patch, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(RolesGuard)
export class EnrollmentController {
  constructor(private service: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll an employee in a course' })
  create(@Body() dto: CreateEnrollmentDto) {
    return this.service.create(dto);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get enrollments by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get enrollments by course' })
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get enrollments by company' })
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an enrollment' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEnrollmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/complete-lesson/:lessonId')
  @ApiOperation({ summary: 'Mark a lesson as completed' })
  completeLesson(@Param('id', ParseUUIDPipe) id: string, @Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.service.completeLesson(id, lessonId);
  }
}
