import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { SecurityGuardService } from './security-guard.service';
import { AssignSecurityGuardDto } from './dto/assign-security-guard.dto';
import { ScanAttendanceDto } from './dto/scan-attendance.dto';

@ApiTags('security-guards')
@Controller('security-guards')
@UseGuards(RolesGuard)
export class SecurityGuardController {
  constructor(private service: SecurityGuardService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign an employee as security guard' })
  assign(@Body() dto: AssignSecurityGuardDto) {
    return this.service.assign(dto.companyId, dto.employeeId);
  }

  @Get()
  @ApiOperation({ summary: 'List security guards by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get security guard by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string, @Query('companyId') companyId: string) {
    return this.service.findByEmployee(employeeId, companyId);
  }

  @Get(':id/scan-history')
  @ApiOperation({ summary: 'Get attendance scan history for a guard' })
  getScanHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getScanHistory(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle security guard active status' })
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a security guard' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan attendance with security guard' })
  scanAttendance(@Body() dto: ScanAttendanceDto) {
    return this.service.scanAttendance(dto.guardId, dto.employeeId);
  }
}
