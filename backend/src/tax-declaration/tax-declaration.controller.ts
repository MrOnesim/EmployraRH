import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TaxDeclarationService } from './tax-declaration.service';
import { CreateTaxDeclarationDto } from './dto/create-tax-declaration.dto';

@ApiTags('Tax Declarations')
@Controller('tax-declarations')
export class TaxDeclarationController {
  constructor(private service: TaxDeclarationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tax declaration' })
  create(@Body() dto: CreateTaxDeclarationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tax declarations by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('by-year')
  @ApiOperation({ summary: 'List tax declarations by year' })
  findByYear(@Query('companyId') companyId: string, @Query('year') year: string) {
    return this.service.findByYear(companyId, parseInt(year, 10));
  }

  @Get('by-type')
  @ApiOperation({ summary: 'List tax declarations by tax type' })
  findByType(@Query('companyId') companyId: string, @Query('taxType') taxType: string) {
    return this.service.findByType(companyId, taxType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tax declaration by id' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a tax declaration' })
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Post(':id/confirm-amount')
  @ApiOperation({ summary: 'Confirm amount for a tax declaration' })
  confirmAmount(@Param('id') id: string, @Body('amount') amount: number) {
    return this.service.confirmAmount(id, amount);
  }

  @Post(':id/paid')
  @ApiOperation({ summary: 'Mark a tax declaration as paid' })
  markPaid(@Param('id') id: string) {
    return this.service.markPaid(id);
  }

  @Get('calculate/:employeeId/:year')
  @ApiOperation({ summary: 'Calculate estimated withholding for employee' })
  calculateWithholding(@Param('employeeId') employeeId: string, @Param('year') year: string) {
    return this.service.calculateWithholding(employeeId, parseInt(year, 10));
  }
}
