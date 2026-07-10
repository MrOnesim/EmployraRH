import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('job-offers')
@Controller('job-offers')
export class JobOfferController {
  constructor(private service: JobOfferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job offer' })
  create(@Body() dto: CreateJobOfferDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job offers' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('open')
  @ApiOperation({ summary: 'Get all open job offers' })
  findOpen() {
    return this.service.findOpen();
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get job offers by company' })
  findByCompany(@Param('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('company/:companyId/status/:status')
  @ApiOperation({ summary: 'Get job offers by company and status' })
  findByStatus(@Param('companyId') companyId: string, @Param('status') status: string) {
    return this.service.findByStatus(companyId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job offer by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/candidates/count')
  @ApiOperation({ summary: 'Get candidate count for a job offer' })
  getCandidateCount(@Param('id') id: string) {
    return this.service.getCandidateCount(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a job offer (draft → open)' })
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a job offer (open → closed)' })
  close(@Param('id') id: string) {
    return this.service.close(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job offer' })
  update(@Param('id') id: string, @Body() dto: UpdateJobOfferDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job offer' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
