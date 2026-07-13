import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { RewardService } from './reward.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { RedeemDto } from './dto/redeem.dto';

@ApiTags('rewards')
@ApiBearerAuth()
@Controller('rewards')
@UseGuards(RolesGuard)
export class RewardController {
  constructor(private service: RewardService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Get reward catalog by company' })
  getCatalog(@Query('companyId') companyId: string) {
    return this.service.getCatalog(companyId);
  }

  @Post('catalog')
  @ApiOperation({ summary: 'Create a reward catalog item' })
  createCatalogItem(@Body() dto: CreateCatalogDto) {
    return this.service.createCatalogItem(dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get reward transactions by employee' })
  getTransactions(@Query('employeeId') employeeId: string) {
    return this.service.getTransactions(employeeId);
  }

  @Get('balance/:employeeId')
  @ApiOperation({ summary: 'Get reward points balance for an employee' })
  getBalance(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.service.getBalance(employeeId);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Add a reward transaction' })
  addTransaction(@Body() dto: CreateTransactionDto) {
    return this.service.addTransaction(dto);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem a reward' })
  redeem(@Body() dto: RedeemDto) {
    return this.service.redeem(dto.employeeId, dto.catalogId);
  }
}
