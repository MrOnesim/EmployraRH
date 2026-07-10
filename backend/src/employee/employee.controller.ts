import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
@UseGuards(RolesGuard)
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'RH')
  @ApiOperation({ summary: 'Get all employees' })
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeeService.findAll(query.companyId || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete an employee' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.delete(id);
  }
}
