import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { EquipmentAssignmentService } from './equipment-assignment.service';
import { CreateEquipmentAssignmentDto } from './dto/create-equipment-assignment.dto';
import { UpdateEquipmentAssignmentDto } from './dto/update-equipment-assignment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('equipment-assignments')
@ApiBearerAuth()
@Controller('equipment-assignments')
@UseGuards(RolesGuard)
export class EquipmentAssignmentController {
  constructor(private service: EquipmentAssignmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new equipment assignment' })
  create(@Body() dto: CreateEquipmentAssignmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get assignments by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get assignments by employee' })
  findByEmployee(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('equipment/:equipmentId')
  @ApiOperation({ summary: 'Get assignment history for equipment' })
  findByEquipment(@Param('equipmentId', ParseCuidPipe) equipmentId: string) {
    return this.service.findByEquipment(equipmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Return equipment' })
  return(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdateEquipmentAssignmentDto) {
    return this.service.return(id, dto.conditionAtReturn);
  }
}
