import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('clock-in/:employeeId')
  @ApiOperation({ summary: 'Clock in an employee' })
  clockIn(@Param('employeeId') employeeId: string) {
    return this.attendanceService.clockIn(employeeId);
  }

  @Post('clock-out/:id')
  @ApiOperation({ summary: 'Clock out an employee' })
  clockOut(@Param('id') id: string) {
    return this.attendanceService.clockOut(id);
  }

  @Post('break/start/:id')
  @ApiOperation({ summary: 'Start break' })
  startBreak(@Param('id') id: string) {
    return this.attendanceService.startBreak(id);
  }

  @Post('break/end/:id')
  @ApiOperation({ summary: 'End break' })
  endBreak(@Param('id') id: string) {
    return this.attendanceService.endBreak(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance by company' })
  findAll(@Query('companyId') companyId: string) {
    return this.attendanceService.findAll(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attendance by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.attendanceService.findByEmployee(employeeId);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan attendance with guard verification' })
  scan(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.scanWithGuard(dto);
  }
}
