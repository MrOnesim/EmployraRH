import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    title: 'New Leave Request',
    message: 'John requested annual leave',
    type: 'leave',
    read: false,
    createdAt: new Date('2026-07-01'),
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('findAll', () => {
    it('should return all notifications without userId filter', async () => {
      const notifications = [mockNotification];
      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter notifications by userId', async () => {
      const notifications = [mockNotification];
      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no notifications exist', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-unknown');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const createData = {
      userId: 'user-1',
      title: 'Payment Received',
      message: 'Salary credited',
      type: 'payment',
    };

    it('should create a notification successfully', async () => {
      prisma.notification.create.mockResolvedValue({ id: 'notif-2', ...createData, read: false });

      const result = await service.create(createData);

      expect(result.id).toBe('notif-2');
      expect(result.read).toBe(false);
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(
        service.create({ ...createData, type: 'invalid_type' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept all valid notification types', async () => {
      const validTypes = ['invitation', 'payment', 'leave', 'attendance', 'payslip', 'recruitment', 'objective', 'review', 'contract', 'document'];
      for (const type of validTypes) {
        prisma.notification.create.mockResolvedValue({ id: `notif-${type}`, ...createData, type, read: false });
        const result = await service.create({ ...createData, type });
        expect(result.type).toBe(type);
      }
    });
  });

  describe('markRead', () => {
    it('should mark a notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockResolvedValue({ ...mockNotification, read: true });

      const result = await service.markRead('notif-1');

      expect(result.read).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { read: true },
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markRead('notif-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllRead', () => {
    it('should mark all unread notifications as read for a user', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllRead('user-1');

      expect(result.count).toBe(3);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
        data: { read: true },
      });
    });

    it('should return count 0 when no unread notifications', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllRead('user-1');

      expect(result.count).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for a user', async () => {
      prisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(5);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
      });
    });

    it('should return 0 when no unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete a notification successfully', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.delete.mockResolvedValue(mockNotification);

      const result = await service.delete('notif-1');

      expect(result.id).toBe('notif-1');
    });

    it('should throw NotFoundException when notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.delete('notif-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
