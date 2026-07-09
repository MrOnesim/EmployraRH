import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { SalaryAdvanceService } from './salary-advance.service';

@Controller('salary-advances')
export class SalaryAdvanceController {
  constructor(private service: SalaryAdvanceService) {}

  @Post()
  create(@Body() body: { employeeId: string; amount: number; currency?: string; reason?: string }) {
    return this.service.create(body);
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
  update(@Param('id') id: string, @Body() body: { status?: string; approvedBy?: string; approvedAt?: Date; paidAt?: Date; repaymentDate?: Date; repaymentAmount?: number }) {
    return this.service.update(id, body);
  }
}
