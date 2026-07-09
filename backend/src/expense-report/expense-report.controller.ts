import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ExpenseReportService } from './expense-report.service';

@Controller('expense-reports')
export class ExpenseReportController {
  constructor(private service: ExpenseReportService) {}

  @Post()
  create(@Body() body: { employeeId: string; title: string; category: string; amount: number; receiptUrl?: string; description?: string; companyId: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { status?: string; approvedBy?: string; approvedAt?: Date; rejectionReason?: string }) {
    return this.service.update(id, body);
  }
}
