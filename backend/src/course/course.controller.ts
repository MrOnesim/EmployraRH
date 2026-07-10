import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses')
@UseGuards(RolesGuard)
export class CourseController {
  constructor(private service: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  create(@Body() dto: CreateCourseDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published courses' })
  findPublished() {
    return this.service.findPublished();
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get courses by company with counts' })
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course (only if no enrollments)' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
