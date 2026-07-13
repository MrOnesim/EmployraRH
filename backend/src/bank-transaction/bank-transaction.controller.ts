import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { BankTransactionService } from './bank-transaction.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';

@ApiTags('Bank Transactions')
@ApiBearerAuth()
@Controller('bank-transactions')
@UseGuards(RolesGuard)
export class BankTransactionController {
  constructor(private service: BankTransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a bank transaction' })
  create(@Body() dto: CreateBankTransactionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bank transactions by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('by-account/:accountId')
  @ApiOperation({ summary: 'List transactions by account' })
  findByAccount(@Param('accountId', ParseCuidPipe) accountId: string) {
    return this.service.findByAccount(accountId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'List transactions by date range' })
  findByDateRange(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.findByDateRange(companyId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank transaction by id' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a transaction as completed' })
  markCompleted(@Param('id', ParseCuidPipe) id: string) {
    return this.service.markCompleted(id);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Mark a transaction as failed' })
  markFailed(@Param('id', ParseCuidPipe) id: string) {
    return this.service.markFailed(id);
  }
}
