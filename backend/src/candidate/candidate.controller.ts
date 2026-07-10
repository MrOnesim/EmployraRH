import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('candidates')
@Controller('candidates')
export class CandidateController {
  constructor(private service: CandidateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate (apply to job offer)' })
  create(@Body() dto: CreateCandidateDto) {
    return this.service.apply(dto.jobOfferId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get candidates by company or job offer' })
  findByCompanyOrOffer(@Query('companyId') companyId?: string, @Query('jobOfferId') jobOfferId?: string) {
    if (jobOfferId) return this.service.findByJobOffer(jobOfferId);
    if (companyId) return this.service.findByCompany(companyId);
    return this.service.findByCompany('');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update candidate status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Patch(':id/schedule-interview')
  @ApiOperation({ summary: 'Schedule interview for candidate' })
  scheduleInterview(@Param('id') id: string, @Body('interviewDate') interviewDate: Date) {
    return this.service.scheduleInterview(id, new Date(interviewDate));
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject candidate' })
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a candidate' })
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.service.update(id, dto);
  }
}
