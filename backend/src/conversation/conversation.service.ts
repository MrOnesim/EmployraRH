import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async create(data: { participantId: string; participantName: string; participantPosition?: string; companyId: string }) {
    return this.prisma.conversation.create({ data });
  }

  async findByCompany(companyId: string) {
    return this.prisma.conversation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByParticipant(companyId: string, participantId: string) {
    return this.prisma.conversation.findFirst({
      where: { companyId, participantId },
    });
  }

  async findMessages(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(conversationId: string, data: { senderId: string; senderName: string; content: string; type?: string }) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: data.content, unread: { increment: 1 } },
    });
    return this.prisma.chatMessage.create({
      data: { ...data, type: data.type || 'text', conversationId },
    });
  }

  async markRead(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return this.prisma.conversation.update({ where: { id: conversationId }, data: { unread: 0 } });
  }
}
