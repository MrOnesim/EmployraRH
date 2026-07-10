import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { ObjectiveService } from './objective.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { UpdateObjectiveStatusDto } from './dto/update-status.dto';

@ApiTags('objectives')
@ApiBearerAuth()
@Controller('objectives')
@UseGuards(RolesGuard)
export class ObjectiveController {
  constructor(private service: ObjectiveService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new objective' })
  create(@Body() dto: CreateObjectiveDto) {
    return this.service.create({ ...dto, deadline: dto.deadline ? new Date(dto.deadline) : undefined });
  }

  @Get()
  @ApiOperation({ summary: 'Get objectives by company' })
  findByCompany(@Query('companyId') companyId: string, @Query('category') category?: string, @Query('status') status?: string) {
    if (category) return this.service.findByCategory(companyId, category);
    if (status) return this.service.findByStatus(companyId, status);
    return this.service.findByCompany(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get objectives by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get objective by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update objective status' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateObjectiveStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an objective (only pending/in_progress)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateObjectiveDto) {
    return this.service.update(id, { ...dto, deadline: dto.deadline ? new Date(dto.deadline) : undefined });
  }
}
