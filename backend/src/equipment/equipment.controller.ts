import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';
import { AssignEquipmentDto } from './dto/assign.dto';
import { ReturnEquipmentDto } from './dto/return.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('equipment')
@ApiBearerAuth()
@Controller('equipment')
@UseGuards(RolesGuard)
export class EquipmentController {
  constructor(private service: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new equipment' })
  create(@Body() dto: CreateEquipmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all equipment' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get equipment by company with assignment status' })
  findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('available/:companyId')
  @ApiOperation({ summary: 'Get available equipment' })
  findAvailable(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.service.findAvailable(companyId);
  }

  @Get('type/:companyId/:type')
  @ApiOperation({ summary: 'Get equipment by type' })
  findByType(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('type') type: string) {
    return this.service.findByType(companyId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEquipmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update equipment status' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEquipmentStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign equipment to employee' })
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignEquipmentDto) {
    return this.service.assign(id, dto.employeeId, dto.conditionAtAssignment);
  }

  @Patch('assignments/:assignmentId/return')
  @ApiOperation({ summary: 'Return equipment from assignment' })
  return(@Param('assignmentId', ParseUUIDPipe) assignmentId: string, @Body() dto: ReturnEquipmentDto) {
    return this.service.return(assignmentId, dto.conditionAtReturn);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete equipment' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
