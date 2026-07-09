import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private service: ConversationService) {}

  @Post()
  create(@Body() body: { participantId: string; participantName: string; participantPosition?: string; companyId: string }) {
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

  @Post(':id/messages')
  addMessage(@Param('id') id: string, @Body() body: { senderId: string; senderName: string; content: string; type?: string }) {
    return this.service.addMessage(id, body);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }
}
