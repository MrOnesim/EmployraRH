import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMessageDto } from './dto/add-message.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationController {
  constructor(private service: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a conversation' })
  create(@Body() body: CreateConversationDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get conversations by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('participant')
  @ApiOperation({ summary: 'Find conversation by participant' })
  findByParticipant(
    @Query('companyId') companyId: string,
    @Query('participantId') participantId: string,
  ) {
    return this.service.findByParticipant(companyId, participantId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  findMessages(@Param('id') id: string) {
    return this.service.findMessages(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(@Param('id') id: string, @Body() body: AddMessageDto) {
    return this.service.sendMessage(id, body);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }
}
