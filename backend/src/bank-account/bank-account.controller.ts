import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';

@Controller('bank-accounts')
export class BankAccountController {
  constructor(private service: BankAccountService) {}

  @Post()
  create(@Body() body: { bankName: string; accountName: string; accountNumber: string; iban?: string; swift?: string; currency?: string; isMobileMoney?: boolean; mobileProvider?: string; companyId: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
