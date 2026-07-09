import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Post()
  create(@Body() body: { userId: string; title: string; message: string; type: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Post('mark-all-read')
  markAllRead(@Body('userId') userId: string) {
    return this.service.markAllRead(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
