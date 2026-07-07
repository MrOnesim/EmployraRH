import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  create(@Body() body: { name: string; slug: string; currency?: string; country?: string }) {
    return this.companyService.create(body);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() body: { userId: string; role?: string }) {
    return this.companyService.addMember(id, body.userId, body.role as any);
  }
}
