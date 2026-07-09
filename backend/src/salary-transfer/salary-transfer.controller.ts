import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SalaryTransferService } from './salary-transfer.service';

@Controller('salary-transfers')
export class SalaryTransferController {
  constructor(private service: SalaryTransferService) {}

  @Post()
  create(@Body() body: { employeeId: string; amount: number; currency?: string; type: string; description?: string }) {
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
}
