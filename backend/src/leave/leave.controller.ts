import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';

@ApiTags('leaves')
@ApiBearerAuth()
@Controller('leaves')
@UseGuards(RolesGuard)
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: 'Create a leave request' })
  create(@Body() dto: CreateLeaveDto) {
    return this.leaveService.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all leaves by company' })
  findAll(@Query('companyId') companyId: string) {
    return this.leaveService.findAll(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get leaves by employee' })
  findByEmployee(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Get('employee/:employeeId/balance')
  @ApiOperation({ summary: 'Get leave balance by employee' })
  getBalance(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.leaveService.getBalance(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a leave by id' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.leaveService.findById(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a leave request' })
  approve(@Param('id', ParseCuidPipe) id: string) {
    return this.leaveService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a leave request with comment' })
  reject(@Param('id', ParseCuidPipe) id: string, @Body() dto: RejectLeaveDto) {
    return this.leaveService.reject(id, dto.comment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a leave request (only if pending)' })
  update(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdateLeaveDto) {
    return this.leaveService.update(id, dto);
  }
}
