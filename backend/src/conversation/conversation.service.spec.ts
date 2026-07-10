import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConversationService', () => {
  let service: ConversationService;
  let prisma: any;

  const mockConversation = {
    id: 'conv-1',
    participantId: 'emp-1',
    participantName: 'John Doe',
    participantPosition: 'Developer',
    companyId: 'comp-1',
    lastMessage: null,
    unread: 0,
    createdAt: new Date('2026-07-01'),
  };

  const mockMessage = {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'emp-1',
    senderName: 'John Doe',
    content: 'Hello!',
    type: 'text',
    createdAt: new Date('2026-07-01'),
  };

  beforeEach(async () => {
    prisma = {
      conversation: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      chatMessage: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  describe('create', () => {
    it('should create a conversation successfully', async () => {
      const createData = {
        participantId: 'emp-2',
        participantName: 'Jane Doe',
        companyId: 'comp-1',
      };
      prisma.conversation.create.mockResolvedValue({ id: 'conv-2', ...createData });

      const result = await service.create(createData);

      expect(result.id).toBe('conv-2');
      expect(prisma.conversation.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('findByCompany', () => {
    it('should return conversations for a company', async () => {
      const conversations = [mockConversation];
      prisma.conversation.findMany.mockResolvedValue(conversations);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByParticipant', () => {
    it('should find a conversation by participant', async () => {
      prisma.conversation.findFirst.mockResolvedValue(mockConversation);

      const result = await service.findByParticipant('comp-1', 'emp-1');

      expect(result.id).toBe('conv-1');
      expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
        where: { companyId: 'comp-1', participantId: 'emp-1' },
      });
    });

    it('should return null when no conversation exists', async () => {
      prisma.conversation.findFirst.mockResolvedValue(null);

      const result = await service.findByParticipant('comp-1', 'emp-unknown');

      expect(result).toBeNull();
    });
  });

  describe('findMessages', () => {
    it('should return messages for a conversation', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.chatMessage.findMany.mockResolvedValue([mockMessage]);

      const result = await service.findMessages('conv-1');

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Hello!');
    });

    it('should throw NotFoundException when conversation not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findMessages('conv-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendMessage', () => {
    const messageData = {
      senderId: 'emp-1',
      senderName: 'John Doe',
      content: 'Hi there!',
    };

    it('should send a message successfully', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.conversation.update.mockResolvedValue({ ...mockConversation, lastMessage: 'Hi there!', unread: 1 });
      prisma.chatMessage.create.mockResolvedValue({ id: 'msg-2', ...messageData, type: 'text', conversationId: 'conv-1' });

      const result = await service.sendMessage('conv-1', messageData);

      expect(result.content).toBe('Hi there!');
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
        data: { lastMessage: 'Hi there!', unread: { increment: 1 } },
      });
    });

    it('should throw NotFoundException when conversation not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.sendMessage('conv-unknown', messageData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markRead', () => {
    it('should mark conversation as read', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.conversation.update.mockResolvedValue({ ...mockConversation, unread: 0 });

      const result = await service.markRead('conv-1');

      expect(result.unread).toBe(0);
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
        data: { unread: 0 },
      });
    });

    it('should throw NotFoundException when conversation not found', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(service.markRead('conv-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
