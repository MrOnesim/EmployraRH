import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@Controller('bank-accounts')
@UseGuards(RolesGuard)
export class BankAccountController {
  constructor(private service: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a bank account' })
  create(@Body() dto: CreateBankAccountDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bank accounts by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank account by id' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bank account' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBankAccountDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bank account' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Set a bank account as default' })
  setDefault(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.setDefault(id);
  }
}
