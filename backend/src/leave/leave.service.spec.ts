import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LeaveService', () => {
  let service: LeaveService;
  let prisma: any;

  const mockEmployee = { id: 'emp-1', companyId: 'comp-1' };
  const mockLeave = {
    id: 'leave-1',
    employeeId: 'emp-1',
    type: 'annual',
    status: 'pending',
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-10'),
    reason: 'Vacation',
    comment: null,
  };

  beforeEach(async () => {
    prisma = {
      employee: { findUnique: vi.fn() },
      leave: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
  });

  describe('create', () => {
    it('should create a leave successfully', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findFirst.mockResolvedValue(null);
      prisma.leave.findMany.mockResolvedValue([]);
      prisma.leave.create.mockResolvedValue(mockLeave);

      const result = await service.create({
        employeeId: 'emp-1',
        type: 'annual',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-10'),
        reason: 'Vacation',
      });

      expect(result).toEqual(mockLeave);
      expect(prisma.leave.create).toHaveBeenCalled();
    });

    it('should throw on invalid leave type', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);

      await expect(
        service.create({
          employeeId: 'emp-1',
          type: 'invalid',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-08-10'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when startDate >= endDate', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);

      await expect(
        service.create({
          employeeId: 'emp-1',
          type: 'annual',
          startDate: new Date('2026-08-10'),
          endDate: new Date('2026-08-01'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw on past startDate', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);

      await expect(
        service.create({
          employeeId: 'emp-1',
          type: 'annual',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2020-01-05'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          employeeId: 'emp-unknown',
          type: 'sick',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-08-05'),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw on overlapping leave', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findFirst.mockResolvedValue({ id: 'existing-leave' });

      await expect(
        service.create({
          employeeId: 'emp-1',
          type: 'annual',
          startDate: new Date('2026-08-05'),
          endDate: new Date('2026-08-15'),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw when annual balance exceeded', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findFirst.mockResolvedValue(null);
      // 20 business days used across 4 Mon-Fri weeks → 5 remaining, but requesting 6
      prisma.leave.findMany.mockResolvedValue([
        { id: 'l-1', type: 'annual', status: 'approved', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-05') },
        { id: 'l-2', type: 'annual', status: 'approved', startDate: new Date('2026-06-08'), endDate: new Date('2026-06-12') },
        { id: 'l-3', type: 'annual', status: 'approved', startDate: new Date('2026-06-15'), endDate: new Date('2026-06-19') },
        { id: 'l-4', type: 'annual', status: 'approved', startDate: new Date('2026-06-22'), endDate: new Date('2026-06-26') },
      ]);

      await expect(
        service.create({
          employeeId: 'emp-1',
          type: 'annual',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-08-10'),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve a pending leave', async () => {
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue({ ...mockLeave, status: 'approved' });

      const result = await service.approve('leave-1');

      expect(result.status).toBe('approved');
      expect(prisma.leave.update).toHaveBeenCalledWith({
        where: { id: 'leave-1' },
        data: { status: 'approved' },
      });
    });

    it('should throw when leave not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);

      await expect(service.approve('leave-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw when trying to approve a rejected leave', async () => {
      prisma.leave.findUnique.mockResolvedValue({ ...mockLeave, status: 'rejected' });

      await expect(service.approve('leave-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when trying to approve an already approved leave', async () => {
      prisma.leave.findUnique.mockResolvedValue({ ...mockLeave, status: 'approved' });

      await expect(service.approve('leave-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a pending leave', async () => {
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue({ ...mockLeave, status: 'rejected', comment: 'Not approved' });

      const result = await service.reject('leave-1', 'Not approved');

      expect(result.status).toBe('rejected');
      expect(prisma.leave.update).toHaveBeenCalledWith({
        where: { id: 'leave-1' },
        data: { status: 'rejected', comment: 'Not approved' },
      });
    });

    it('should throw when leave not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);

      await expect(service.reject('leave-unknown', 'reason')).rejects.toThrow(NotFoundException);
    });

    it('should throw when trying to reject an already rejected leave', async () => {
      prisma.leave.findUnique.mockResolvedValue({ ...mockLeave, status: 'rejected' });

      await expect(service.reject('leave-1', 'again')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBalance', () => {
    it('should return leave balance with annual days calculated', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findMany.mockResolvedValue([]);

      const result = await service.getBalance('emp-1');

      expect(result).toEqual({
        annual: 25,
        sick: null,
        personal: null,
        maternity: null,
        paternity: null,
      });
    });

    it('should subtract used annual days from balance', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      // 5 business days used (Mon-Fri)
      prisma.leave.findMany.mockResolvedValue([
        {
          id: 'l-1',
          type: 'annual',
          status: 'approved',
          startDate: new Date('2026-07-06'),
          endDate: new Date('2026-07-10'),
        },
      ]);

      const result = await service.getBalance('emp-1');

      expect(result.annual).toBe(20);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.getBalance('emp-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return leaves for a company', async () => {
      const leaves = [
        { ...mockLeave, employee: mockEmployee },
        { ...mockLeave, id: 'leave-2', employee: mockEmployee },
      ];
      prisma.leave.findMany.mockResolvedValue(leaves);

      const result = await service.findAll('comp-1');

      expect(result).toHaveLength(2);
      expect(prisma.leave.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' } },
        include: { employee: true },
      });
    });
  });

  describe('findByEmployee', () => {
    it('should return leaves for an employee', async () => {
      const leaves = [{ ...mockLeave, employee: mockEmployee }];
      prisma.leave.findMany.mockResolvedValue(leaves);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.leave.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        include: { employee: true },
      });
    });
  });

  describe('findById', () => {
    it('should return a leave by id', async () => {
      prisma.leave.findUnique.mockResolvedValue({ ...mockLeave, employee: mockEmployee });

      const result = await service.findById('leave-1');

      expect(result.id).toBe('leave-1');
    });

    it('should throw when leave not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);

      await expect(service.findById('leave-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
