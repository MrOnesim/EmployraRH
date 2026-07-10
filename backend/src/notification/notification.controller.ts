import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  create(@Body() body: CreateNotificationDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  findAll(@Query('userId') userId?: string) {
    return this.service.findAll(userId);
  }

  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.service.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for user' })
  markAllRead(@Body('userId') userId: string) {
    return this.service.markAllRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
