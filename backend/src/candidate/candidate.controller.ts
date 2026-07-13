import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { UpdateCandidateStatusDto } from './dto/update-status.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('candidates')
@ApiBearerAuth()
@Controller('candidates')
@UseGuards(RolesGuard)
export class CandidateController {
  constructor(private service: CandidateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate (apply to job offer)' })
  create(@Body() dto: CreateCandidateDto) {
    return this.service.apply(dto.jobOfferId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get candidates by company or job offer' })
  findByCompanyOrOffer(
    @Query('companyId') companyId?: string,
    @Query('jobOfferId') jobOfferId?: string,
  ) {
    if (jobOfferId) return this.service.findByJobOffer(jobOfferId);
    if (companyId) return this.service.findByCompany(companyId);
    return this.service.findByCompany('');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update candidate status' })
  updateStatus(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdateCandidateStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Patch(':id/schedule-interview')
  @ApiOperation({ summary: 'Schedule interview for candidate' })
  scheduleInterview(@Param('id', ParseCuidPipe) id: string, @Body() dto: ScheduleInterviewDto) {
    return this.service.scheduleInterview(id, new Date(dto.interviewDate));
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject candidate' })
  reject(@Param('id', ParseCuidPipe) id: string) {
    return this.service.reject(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a candidate' })
  update(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdateCandidateDto) {
    return this.service.update(id, dto);
  }
}
