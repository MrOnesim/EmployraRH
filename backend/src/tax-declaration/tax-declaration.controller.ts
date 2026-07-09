import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { TaxDeclarationService } from './tax-declaration.service';

@Controller('tax-declarations')
export class TaxDeclarationController {
  constructor(private service: TaxDeclarationService) {}

  @Post()
  create(@Body() body: { companyId: string; employeeId: string; year: number; taxType: string; taxableIncome: number; taxWithheld: number; declarationDate?: Date; dueDate: Date; status?: string; notes?: string }) {
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
  update(@Param('id') id: string, @Body() body: { status?: string; confirmedAmount?: number; paidAt?: Date; notes?: string }) {
    return this.service.update(id, body);
  }
}
