import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayslipService } from './payslip.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { GeneratePayslipDto } from './dto/generate-payslip.dto';

@ApiTags('Payslips')
@ApiBearerAuth()
@Controller('payslips')
@UseGuards(RolesGuard)
export class PayslipController {
  constructor(private payslipService: PayslipService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate payslip for employee/month/year' })
  generate(@Body() dto: GeneratePayslipDto) {
    return this.payslipService.generate(dto.employeeId, dto.month, dto.year);
  }

  @Get()
  @ApiOperation({ summary: 'Get payslips by company (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findByCompany(
    @Query('companyId') companyId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.payslipService.findByCompany(companyId, +page, +limit);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get payslips by employee (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findByEmployee(
    @Param('employeeId', ParseCuidPipe) employeeId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.payslipService.findByEmployee(employeeId, +page, +limit);
  }

  @Get('employee/:employeeId/:month/:year')
  @ApiOperation({ summary: 'Get payslip by employee and period' })
  findByEmployeeAndPeriod(
    @Param('employeeId', ParseCuidPipe) employeeId: string,
    @Param('month') month: string,
    @Param('year') year: string,
  ) {
    return this.payslipService.findByEmployeeAndPeriod(employeeId, +month, +year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payslip by id' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.payslipService.findById(id);
  }
}
