import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('equipment')
@Controller('equipment')
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
  findByCompany(@Param('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('available/:companyId')
  @ApiOperation({ summary: 'Get available equipment' })
  findAvailable(@Param('companyId') companyId: string) {
    return this.service.findAvailable(companyId);
  }

  @Get('type/:companyId/:type')
  @ApiOperation({ summary: 'Get equipment by type' })
  findByType(@Param('companyId') companyId: string, @Param('type') type: string) {
    return this.service.findByType(companyId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment' })
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update equipment status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign equipment to employee' })
  assign(@Param('id') id: string, @Body('employeeId') employeeId: string, @Body('conditionAtAssignment') conditionAtAssignment?: string) {
    return this.service.assign(id, employeeId, conditionAtAssignment);
  }

  @Patch('assignments/:assignmentId/return')
  @ApiOperation({ summary: 'Return equipment from assignment' })
  return(@Param('assignmentId') assignmentId: string, @Body('conditionAtReturn') conditionAtReturn?: string) {
    return this.service.return(assignmentId, conditionAtReturn);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete equipment' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
