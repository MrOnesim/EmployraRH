import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PayslipService } from './payslip.service';

@Controller('payslips')
export class PayslipController {
  constructor(private payslipService: PayslipService) {}

  @Post()
  create(@Body() body: { employeeId: string; month: number; year: number; grossSalary: number; netSalary: number }) {
    return this.payslipService.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.payslipService.findAll(companyId);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payslipService.findByEmployee(employeeId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.payslipService.findById(id);
  }
}
