import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpenseReportService } from './expense-report.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateExpenseReportDto } from './dto/create-expense-report.dto';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';
import { ReceiptExpenseDto } from './dto/receipt-expense.dto';

@ApiTags('expense-reports')
@ApiBearerAuth()
@Controller('expense-reports')
@UseGuards(RolesGuard)
export class ExpenseReportController {
  constructor(private readonly service: ExpenseReportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense report' })
  create(@Body() dto: CreateExpenseReportDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense reports' })
  findAll(@Query('companyId') companyId?: string) {
    return companyId
      ? this.service.findByCompany(companyId)
      : this.service.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get expense reports by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('mission/:missionId')
  @ApiOperation({ summary: 'Get expense reports by mission' })
  findByMission(@Param('missionId', ParseUUIDPipe) missionId: string) {
    return this.service.findByMission(missionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense report by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve an expense report' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveExpenseDto,
  ) {
    return this.service.approve(id, dto);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject an expense report' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectExpenseDto,
  ) {
    return this.service.reject(id, dto);
  }

  @Patch(':id/receipt')
  @ApiOperation({ summary: 'Upload receipt URL for an expense report' })
  uploadReceipt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceiptExpenseDto,
  ) {
    return this.service.uploadReceipt(id, dto);
  }
}
