import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('enrollments')
@ApiBearerAuth()
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
  findByEmployee(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get enrollments by course' })
  findByCourse(@Param('courseId', ParseCuidPipe) courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get enrollments by company' })
  findByCompany(@Param('companyId', ParseCuidPipe) companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an enrollment' })
  update(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdateEnrollmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/complete-lesson/:lessonId')
  @ApiOperation({ summary: 'Mark a lesson as completed' })
  completeLesson(
    @Param('id', ParseCuidPipe) id: string,
    @Param('lessonId', ParseCuidPipe) lessonId: string,
  ) {
    return this.service.completeLesson(id, lessonId);
  }
}
