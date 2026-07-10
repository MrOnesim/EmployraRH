import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PayrollConfigService } from './payroll-config.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePayrollConfigDto } from './dto/create-payroll-config.dto';
import { UpdatePayrollConfigDto } from './dto/update-payroll-config.dto';

@ApiTags('Payroll Config')
@Controller('payroll/config')
@UseGuards(RolesGuard)
export class PayrollConfigController {
  constructor(private payrollConfigService: PayrollConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get payroll config by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.payrollConfigService.findByCompany(companyId);
  }

  @Put()
  @ApiOperation({ summary: 'Create or update payroll config' })
  upsert(@Body() dto: CreatePayrollConfigDto) {
    const { companyId, ...data } = dto;
    return this.payrollConfigService.upsert(companyId, data as UpdatePayrollConfigDto);
  }
}
