import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ObjectiveService } from './objective.service';

@Controller('objectives')
export class ObjectiveController {
  constructor(private service: ObjectiveService) {}

  @Post()
  create(@Body() body: { employeeId: string; title: string; description?: string; category: string; deadline?: Date }) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { status?: string }) {
    return this.service.update(id, body);
  }
}
