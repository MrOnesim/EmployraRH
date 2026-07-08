import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('clock-in/:employeeId')
  clockIn(@Param('employeeId') employeeId: string) {
    return this.attendanceService.clockIn(employeeId);
  }

  @Post('clock-out/:id')
  clockOut(@Param('id') id: string) {
    return this.attendanceService.clockOut(id);
  }

  @Post('break/start/:id')
  startBreak(@Param('id') id: string) {
    return this.attendanceService.startBreak(id);
  }

  @Post('break/end/:id')
  endBreak(@Param('id') id: string) {
    return this.attendanceService.endBreak(id);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.attendanceService.findAll(companyId);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.attendanceService.findByEmployee(employeeId);
  }
}
