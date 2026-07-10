import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SalaryAdvanceService } from './salary-advance.service';
import { CreateSalaryAdvanceDto } from './dto/create-salary-advance.dto';
import { ApproveAdvanceDto } from './dto/approve-advance.dto';

@ApiTags('Salary Advances')
@Controller('salary-advances')
export class SalaryAdvanceController {
  constructor(private service: SalaryAdvanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a salary advance request' })
  create(@Body() dto: CreateSalaryAdvanceDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salary advances by company' })
  findAll(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a salary advance by id' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get salary advances by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a salary advance' })
  approve(@Param('id') id: string, @Body() dto: ApproveAdvanceDto) {
    return this.service.approve(id, dto.approvedBy);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a salary advance' })
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }

  @Patch(':id/paid')
  @ApiOperation({ summary: 'Mark a salary advance as paid' })
  markPaid(@Param('id') id: string) {
    return this.service.markPaid(id);
  }

  @Patch(':id/repaid')
  @ApiOperation({ summary: 'Mark a salary advance as repaid' })
  markRepaid(@Param('id') id: string) {
    return this.service.markRepaid(id);
  }
}
