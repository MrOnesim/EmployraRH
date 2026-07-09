import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BankTransactionService } from './bank-transaction.service';

@Controller('bank-transactions')
export class BankTransactionController {
  constructor(private service: BankTransactionService) {}

  @Post()
  create(@Body() body: { type: string; amount: number; currency?: string; description?: string; reference: string; accountId: string; companyId: string }) {
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
}
