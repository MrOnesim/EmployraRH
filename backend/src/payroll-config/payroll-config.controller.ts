import { Controller, Get, Put, Body, Query } from '@nestjs/common';
import { PayrollConfigService } from './payroll-config.service';

@Controller('payroll/config')
export class PayrollConfigController {
  constructor(private payrollConfigService: PayrollConfigService) {}

  @Get()
  getConfig(@Query('companyId') companyId: string) {
    return this.payrollConfigService.getConfig(companyId);
  }

  @Put()
  upsertConfig(@Body() body: { companyId: string; currency?: string; taxRate?: number; socialChargesRate?: number; paymentDay?: number; overtimeRate?: number }) {
    const { companyId, ...data } = body;
    return this.payrollConfigService.upsertConfig(companyId, data);
  }
}
