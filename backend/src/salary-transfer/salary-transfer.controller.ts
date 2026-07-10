import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { SalaryTransferService } from './salary-transfer.service';
import { CreateSalaryTransferDto } from './dto/create-salary-transfer.dto';

@ApiTags('Salary Transfers')
@ApiBearerAuth()
@Controller('salary-transfers')
@UseGuards(RolesGuard)
export class SalaryTransferController {
  constructor(private service: SalaryTransferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a salary transfer' })
  create(@Body() dto: CreateSalaryTransferDto) {
    return this.service.create(dto);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'List salary transfers by company' })
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('company/:companyId/type/:type')
  @ApiOperation({ summary: 'List salary transfers by company and type' })
  findByType(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('type') type: string) {
    return this.service.findByType(companyId, type);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'List salary transfers by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a salary transfer by id' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a salary transfer' })
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.complete(id);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Fail a salary transfer' })
  fail(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.fail(id);
  }
}
