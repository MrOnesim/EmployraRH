import { Controller, Get, Post, Body, Res, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { ComplianceService } from './compliance.service';
import { PayslipPdfService } from './payslip-pdf.service';
import { SimulatePayslipDto } from './dto/simulate-payslip.dto';
import { SimulatePdfParamsDto } from './dto/simulate-pdf-params.dto';

@ApiTags('compliance')
@Controller('compliance')
export class ComplianceController {
  constructor(
    private readonly service: ComplianceService,
    private readonly pdf: PayslipPdfService,
  ) {}

  @Get('countries')
  @Public()
  @ApiOperation({ summary: 'List supported countries with compliance rules' })
  getSupportedCountries() {
    return this.service.getSupportedCountries();
  }

  @Post('simulate')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simulate a payslip calculation without creating records' })
  async simulate(@Body() dto: SimulatePayslipDto) {
    return this.service.calculatePayslip(
      'simulation',
      dto.month,
      dto.year,
      dto.grossSalary,
      dto.countryCode,
    );
  }

  @Post('simulate/pdf')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simulate payslip and return PDF stream' })
  async simulatePdf(@Body() dto: SimulatePayslipDto, @Res() res: Response) {
    const { result, countryCode } = await this.service.calculatePayslip(
      'simulation',
      dto.month,
      dto.year,
      dto.grossSalary,
      dto.countryCode,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bulletin-paie-${countryCode}-${dto.month}-${dto.year}.pdf"`,
    });

    this.pdf.generate(result, countryCode, dto.month, dto.year).pipe(res);
  }

  @Get('simulate/pdf/:countryCode/:grossSalary/:month/:year')
  @Public()
  @ApiOperation({ summary: 'Simulate payslip PDF via GET (convenience)' })
  async simulatePdfGet(@Param() params: SimulatePdfParamsDto, @Res() res: Response) {
    const { result, countryCode: cc } = await this.service.calculatePayslip(
      'simulation',
      params.month,
      params.year,
      params.grossSalary,
      params.countryCode,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bulletin-paie-${cc}-${params.month}-${params.year}.pdf"`,
    });

    this.pdf.generate(result, cc, params.month, params.year).pipe(res);
  }
}
