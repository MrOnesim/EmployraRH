import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ComplianceService } from './compliance.service';

@ApiTags('compliance')
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  @Get('countries')
  @Public()
  @ApiOperation({ summary: 'List supported countries with compliance rules' })
  getSupportedCountries() {
    return this.service.getSupportedCountries();
  }

  @Post('simulate')
  @Public()
  @ApiOperation({ summary: 'Simulate a payslip calculation without creating records' })
  async simulate(
    @Body() input: { grossSalary: number; countryCode: string; month: number; year: number },
  ) {
    return this.service.calculatePayslip(
      'simulation',
      input.month,
      input.year,
      input.grossSalary,
      input.countryCode,
    );
  }
}
