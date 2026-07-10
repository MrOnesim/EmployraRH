import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { CalendarEventService } from './calendar-event.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@ApiTags('Calendar Events')
@Controller('calendar-events')
@UseGuards(RolesGuard)
export class CalendarEventController {
  constructor(private service: CalendarEventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a calendar event' })
  create(@Body() body: CreateCalendarEventDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get calendar events by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming calendar events' })
  findUpcoming(@Query('companyId') companyId: string, @Query('limit') limit?: string) {
    return this.service.findUpcoming(companyId, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('range')
  @ApiOperation({ summary: 'Get calendar events by date range' })
  findByDateRange(
    @Query('companyId') companyId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.service.findByDateRange(companyId, start, end);
  }

  @Get('type')
  @ApiOperation({ summary: 'Get calendar events by type' })
  findByType(@Query('companyId') companyId: string, @Query('type') type: string) {
    return this.service.findByType(companyId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calendar event by id' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a calendar event' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateCalendarEventDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a calendar event' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
