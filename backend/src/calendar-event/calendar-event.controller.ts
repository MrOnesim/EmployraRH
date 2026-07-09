import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';

@Controller('calendar-events')
export class CalendarEventController {
  constructor(private service: CalendarEventService) {}

  @Post()
  create(@Body() body: { title: string; description?: string; date: Date; time?: string; location?: string; type: string; companyId: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
