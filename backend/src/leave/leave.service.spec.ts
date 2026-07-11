import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LeaveService } from './leave.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

describe('LeaveService', () => {
  let service: LeaveService;
  let prisma: any;
  let cache: any;

  const mockEmployee = {
    id: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    companyId: 'c1',
    email: 'john@test.com',
  };
  const mockLeave = {
    id: 'leave-1',
    employeeId: 'emp-1',
    type: 'annual',
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-05'),
    reason: 'Vacances',
    status: 'pending',
    comment: null,
    employee: mockEmployee,
  };

  beforeEach(async () => {
    prisma = {
      leave: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      employee: { findUnique: vi.fn() },
      member: { findMany: vi.fn() },
    };
    cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
    };
    const mailService = { sendMail: vi.fn().mockResolvedValue({ messageId: 'test' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mailService },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
  });

  describe('create', () => {
    const validInput = {
      employeeId: 'emp-1',
      type: 'annual' as const,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-05'),
      reason: 'Vacances',
    };

    it('should create a leave when input is valid', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findFirst.mockResolvedValue(null);
      prisma.leave.findMany.mockResolvedValue([]);
      prisma.leave.create.mockResolvedValue(mockLeave);
      const result = await service.create(validInput);
      expect(result.id).toBe('leave-1');
    });

    it('should reject invalid leave type', async () => {
      await expect(service.create({ ...validInput, type: 'unknown' as any })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject past startDate', async () => {
      const past = new Date('2024-01-01');
      await expect(
        service.create({ ...validInput, startDate: past, endDate: past }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject endDate before startDate', async () => {
      await expect(
        service.create({
          ...validInput,
          startDate: new Date('2026-08-10'),
          endDate: new Date('2026-08-05'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.create(validInput)).rejects.toThrow(NotFoundException);
    });

    it('should reject overlapping leave', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findFirst.mockResolvedValue(mockLeave);
      await expect(service.create(validInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('approve', () => {
    it('should approve a pending leave', async () => {
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue({ ...mockLeave, status: 'approved' });
      cache.del.mockResolvedValue(true);
      const result = await service.approve('leave-1');
      expect(result.status).toBe('approved');
    });

    it('should throw when leave not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);
      await expect(service.approve('missing')).rejects.toThrow(NotFoundException);
    });

    it('should reject approving non-pending leave', async () => {
      prisma.leave.findUnique.mockResolvedValue({ ...mockLeave, status: 'approved' });
      await expect(service.approve('leave-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a pending leave with comment', async () => {
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue({
        ...mockLeave,
        status: 'rejected',
        comment: 'Pas assez de soldes',
      });
      cache.del.mockResolvedValue(true);
      const result = await service.reject('leave-1', 'Pas assez de soldes');
      expect(result.status).toBe('rejected');
    });
  });

  describe('findById', () => {
    it('should return leave with employee', async () => {
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      const result = await service.findById('leave-1');
      expect(result.employee.firstName).toBe('John');
    });

    it('should throw when not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRemainingAnnualDays', () => {
    it('should return 25 when no leaves', async () => {
      prisma.leave.findMany.mockResolvedValue([]);
      const result = await service.getRemainingAnnualDays('emp-1');
      expect(result).toBe(25);
    });

    it('should subtract used days', async () => {
      prisma.leave.findMany.mockResolvedValue([
        { startDate: new Date('2026-07-01'), endDate: new Date('2026-07-05') },
      ]);
      const result = await service.getRemainingAnnualDays('emp-1');
      expect(result).toBeLessThan(25);
    });
  });

  describe('findAll', () => {
    it('should return leaves with caching', async () => {
      cache.get.mockResolvedValue(null);
      prisma.leave.findMany.mockResolvedValue([mockLeave]);
      const result = await service.findAll('c1');
      expect(result).toHaveLength(1);
      expect(cache.set).toHaveBeenCalled();
    });

    it('should return cached result when available', async () => {
      cache.get.mockResolvedValue([mockLeave]);
      const result = await service.findAll('c1');
      expect(result).toHaveLength(1);
      expect(prisma.leave.findMany).not.toHaveBeenCalled();
    });
  });
});
