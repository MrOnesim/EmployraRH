import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(RolesGuard)
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
  getUnreadCount(@Param('userId', ParseCuidPipe) userId: string) {
    return this.service.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id', ParseCuidPipe) id: string) {
    return this.service.markRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for user' })
  markAllRead(@Body() dto: MarkReadDto) {
    return this.service.markAllRead(dto.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  delete(@Param('id', ParseCuidPipe) id: string) {
    return this.service.delete(id);
  }
}
