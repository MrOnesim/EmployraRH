import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { SecurityGuardService } from './security-guard.service';

@Controller('security-guards')
export class SecurityGuardController {
  constructor(private service: SecurityGuardService) {}

  @Post('assign')
  assign(@Body() body: { employeeId: string; companyId: string }) {
    return this.service.assign(body.employeeId, body.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string, @Query('companyId') companyId: string) {
    return this.service.findByEmployee(employeeId, companyId);
  }

  @Post('scan')
  scanAttendance(@Body() body: { guardId: string; employeeId: string }) {
    return this.service.scanAttendance(body.guardId, body.employeeId);
  }
}
