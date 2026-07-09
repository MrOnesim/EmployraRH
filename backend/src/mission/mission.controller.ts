import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { MissionService } from './mission.service';

@Controller('missions')
export class MissionController {
  constructor(private service: MissionService) {}

  @Post()
  create(@Body() body: { employeeId: string; title: string; destination: string; startDate: Date; endDate: Date; description?: string; budget?: number; transportation?: string; accommodation?: string; companyId: string }) {
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
  update(@Param('id') id: string, @Body() body: { status?: string; report?: string; actualExpenses?: number }) {
    return this.service.update(id, body);
  }
}
