import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { MeetingService } from './meeting.service';

@Controller('meetings')
export class MeetingController {
  constructor(private meetingService: MeetingService) {}

  @Post()
  create(@Body() body: { title: string; description?: string; date: string; duration: number; link?: string; location?: string; companyId: string }) {
    return this.meetingService.create({ ...body, date: new Date(body.date) });
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.meetingService.findAll(companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; description: string; date: string; duration: number; link: string; location: string }>) {
    const data = body.date ? { ...body, date: new Date(body.date) as Date } : body;
    return this.meetingService.update(id, data as any);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Body() body: { name?: string; email?: string; employeeId?: string }) {
    return this.meetingService.join(id, body);
  }

  @Post(':id/leave')
  leave(@Param('id') id: string, @Body() body: { participantId: string }) {
    return this.meetingService.leave(id, body.participantId);
  }
}
