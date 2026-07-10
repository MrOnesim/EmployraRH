import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PerformanceReviewService } from './performance-review.service';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { AcknowledgeReviewDto } from './dto/acknowledge-review.dto';

@ApiTags('Performance Reviews')
@Controller('performance-reviews')
export class PerformanceReviewController {
  constructor(private service: PerformanceReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a performance review' })
  create(@Body() dto: CreatePerformanceReviewDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all performance reviews by company' })
  findAll(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a performance review by id' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get performance reviews by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('reviewer/:reviewerId')
  @ApiOperation({ summary: 'Get performance reviews by reviewer' })
  findByReviewer(@Param('reviewerId') reviewerId: string) {
    return this.service.findByReviewer(reviewerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a performance review (only if draft)' })
  update(@Param('id') id: string, @Body() dto: UpdatePerformanceReviewDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit a performance review' })
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Patch(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a performance review' })
  acknowledge(@Param('id') id: string, @Body() dto: AcknowledgeReviewDto) {
    return this.service.acknowledge(id, dto.employeeId);
  }
}
