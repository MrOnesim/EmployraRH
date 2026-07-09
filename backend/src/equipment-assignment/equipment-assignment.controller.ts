import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { EquipmentAssignmentService } from './equipment-assignment.service';

@Controller('equipment-assignments')
export class EquipmentAssignmentController {
  constructor(private service: EquipmentAssignmentService) {}

  @Post()
  create(@Body() body: { equipmentId: string; employeeId: string; conditionAtAssignment?: string }) {
    return this.service.create(body);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/return')
  return(@Param('id') id: string, @Body('conditionAtReturn') conditionAtReturn?: string) {
    return this.service.return(id, conditionAtReturn);
  }
}
