import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('employees')
@UseGuards(RolesGuard)
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  create(@Body() body: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
    department?: string;
    salary?: number;
    companyId: string;
  }) {
    return this.employeeService.create(body);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'RH')
  findAll(@Param('companyId') companyId?: string) {
    return this.employeeService.findAll(companyId || '');
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.employeeService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    salary: number;
  }>) {
    return this.employeeService.update(id, body);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  delete(@Param('id') id: string) {
    return this.employeeService.delete(id);
  }
}
