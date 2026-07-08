import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { LeaveService } from './leave.service';

@Controller('leaves')
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post()
  create(@Body() body: { employeeId: string; type: string; startDate: string; endDate: string; reason?: string }) {
    return this.leaveService.create({
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.leaveService.findAll(companyId);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { status?: string; comment?: string }) {
    return this.leaveService.update(id, body);
  }
}
