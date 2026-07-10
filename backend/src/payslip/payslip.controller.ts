import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PayslipService } from './payslip.service';
import { GeneratePayslipDto } from './dto/generate-payslip.dto';

@ApiTags('Payslips')
@Controller('payslips')
export class PayslipController {
  constructor(private payslipService: PayslipService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate payslip for employee/month/year' })
  generate(@Body() dto: GeneratePayslipDto) {
    return this.payslipService.generate(dto.employeeId, dto.month, dto.year);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payslips by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.payslipService.findByCompany(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get payslips by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payslipService.findByEmployee(employeeId);
  }

  @Get('employee/:employeeId/:month/:year')
  @ApiOperation({ summary: 'Get payslip by employee and period' })
  findByEmployeeAndPeriod(
    @Param('employeeId') employeeId: string,
    @Param('month') month: string,
    @Param('year') year: string,
  ) {
    return this.payslipService.findByEmployeeAndPeriod(employeeId, +month, +year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payslip by id' })
  findById(@Param('id') id: string) {
    return this.payslipService.findById(id);
  }
}
