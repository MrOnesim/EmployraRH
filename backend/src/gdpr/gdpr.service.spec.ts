import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { GdprService } from './gdpr.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

describe('GdprService', () => {
  let service: GdprService;
  let prisma: any;

  const mockUser = {
    id: 'user-1',
    email: 'john@test.com',
    name: 'John',
    password: 'hashed',
    members: [],
  };

  beforeEach(async () => {
    prisma = {
      gdprAccessLog: { create: vi.fn(), deleteMany: vi.fn() },
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
      },
      employee: { findMany: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
      $transaction: vi.fn((ops: any[]) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GdprService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<GdprService>(GdprService);
  });

  describe('logAccess', () => {
    it('should create an access log entry', async () => {
      prisma.gdprAccessLog.create.mockResolvedValue({ id: 'log-1' });
      await service.logAccess('actor-1', 'target-1', 'EXPORT_MY_DATA');
      expect(prisma.gdprAccessLog.create).toHaveBeenCalledWith({
        data: { actorId: 'actor-1', targetUserId: 'target-1', action: 'EXPORT_MY_DATA' },
      });
    });
  });

  describe('exportUserData', () => {
    it('should return a structured export', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, members: [] });
      prisma.employee.findMany.mockResolvedValue([]);
      const result = await service.exportUserData('user-1');
      expect(result.user.email).toBe('john@test.com');
      expect(result.employees).toEqual([]);
    });

    it('should throw NotFoundException when user is missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.exportUserData('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('eraseOwnAccount', () => {
    it('should soft-delete when password is valid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true);
      prisma.employee.updateMany.mockResolvedValue({ count: 0 });
      prisma.user.update.mockResolvedValue({ ...mockUser, deletedAt: new Date() });
      prisma.gdprAccessLog.create.mockResolvedValue({ id: 'log-1' });

      const result = await service.eraseOwnAccount('user-1', 'secret');
      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);
      await expect(service.eraseOwnAccount('user-1', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('purgeExpired', () => {
    it('should purge expired soft-deleted users and logs', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'old-1' }]);
      prisma.employee.deleteMany.mockResolvedValue({ count: 1 });
      prisma.user.deleteMany.mockResolvedValue({ count: 1 });
      prisma.gdprAccessLog.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.purgeExpired();
      expect(result.purgedUsers).toBe(1);
      expect(result.purgedLogs).toBe(2);
    });
  });
});
