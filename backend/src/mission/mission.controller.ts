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
import { MissionService } from './mission.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMissionDto } from './dto/create-mission.dto';
import { CompleteMissionDto } from './dto/complete-mission.dto';
import { SubmitExpenseDto } from './dto/submit-expense.dto';

@ApiTags('missions')
@ApiBearerAuth()
@Controller('missions')
@UseGuards(RolesGuard)
export class MissionController {
  constructor(private readonly service: MissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mission' })
  create(@Body() dto: CreateMissionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all missions' })
  findAll(@Query('companyId') companyId?: string) {
    return companyId
      ? this.service.findByCompany(companyId)
      : this.service.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get missions by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mission by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'Get linked expense reports for a mission' })
  getExpenses(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getExpenses(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a mission' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a mission' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.reject(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a mission' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteMissionDto,
  ) {
    return this.service.complete(id, dto);
  }

  @Patch(':id/submit-expense')
  @ApiOperation({ summary: 'Link an expense report to a mission' })
  submitExpense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitExpenseDto,
  ) {
    return this.service.submitExpense(id, dto);
  }
}
