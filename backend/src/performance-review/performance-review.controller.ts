import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceReviewService } from './performance-review.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { AcknowledgeReviewDto } from './dto/acknowledge-review.dto';

@ApiTags('Performance Reviews')
@ApiBearerAuth()
@Controller('performance-reviews')
@UseGuards(RolesGuard)
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
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get performance reviews by employee' })
  findByEmployee(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('reviewer/:reviewerId')
  @ApiOperation({ summary: 'Get performance reviews by reviewer' })
  findByReviewer(@Param('reviewerId', ParseCuidPipe) reviewerId: string) {
    return this.service.findByReviewer(reviewerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a performance review (only if draft)' })
  update(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdatePerformanceReviewDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit a performance review' })
  submit(@Param('id', ParseCuidPipe) id: string) {
    return this.service.submit(id);
  }

  @Patch(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a performance review' })
  acknowledge(@Param('id', ParseCuidPipe) id: string, @Body() dto: AcknowledgeReviewDto) {
    return this.service.acknowledge(id, dto.employeeId);
  }
}
