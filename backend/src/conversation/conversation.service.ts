import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.conversation.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async findById(id: string) {
    return this.prisma.conversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: 'asc' } } } });
  }

  async create(data: { participantId: string; participantName: string; participantPosition?: string; companyId: string }) {
    return this.prisma.conversation.create({ data });
  }

  async addMessage(conversationId: string, data: { senderId: string; senderName: string; content: string; type?: string }) {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: data.content, unread: { increment: 1 } },
    });
    return this.prisma.chatMessage.create({
      data: { ...data, type: data.type || 'text', conversationId },
    });
  }

  async markRead(id: string) {
    return this.prisma.conversation.update({ where: { id }, data: { unread: 0 } });
  }
}
