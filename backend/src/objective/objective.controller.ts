import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ObjectiveService } from './objective.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('objectives')
@Controller('objectives')
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
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get objective by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update objective status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an objective (only pending/in_progress)' })
  update(@Param('id') id: string, @Body() dto: UpdateObjectiveDto) {
    return this.service.update(id, { ...dto, deadline: dto.deadline ? new Date(dto.deadline) : undefined });
  }
}
