import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';

@Controller('job-offers')
export class JobOfferController {
  constructor(private service: JobOfferService) {}

  @Post()
  create(@Body() body: { title: string; department: string; description?: string; requirements?: string; salary?: number; location?: string; type?: string; createdBy: string; companyId: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
