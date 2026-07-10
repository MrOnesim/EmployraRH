import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { SalaryAdvanceService } from './salary-advance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SalaryAdvanceService', () => {
  let service: SalaryAdvanceService;
  let prisma: any;

  const mockEmployee = { id: 'emp-1', companyId: 'comp-1', salary: 3000 };
  const mockAdvance = { id: 'adv-1', employeeId: 'emp-1', amount: 1000, status: 'requested', currency: 'EUR', reason: null, repaymentStatus: 'pending', approvedAt: null, paidAt: null, repaymentDate: null, repaymentAmount: null, approvedBy: null, requestedAt: new Date() };

  beforeEach(async () => {
    prisma = {
      employee: { findUnique: vi.fn() },
      salaryAdvance: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryAdvanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SalaryAdvanceService>(SalaryAdvanceService);
  });

  describe('create', () => {
    it('should create a salary advance', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.salaryAdvance.count.mockResolvedValue(0);
      prisma.salaryAdvance.create.mockImplementation((d: any) => Promise.resolve({ id: 'adv-new', ...d.data }));

      const result = await service.create({ employeeId: 'emp-1', amount: 1000 });

      expect(result).toBeDefined();
      expect(result.amount).toBe(1000);
      expect(prisma.salaryAdvance.create).toHaveBeenCalled();
    });

    it('should reject amount > 50% of salary', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);

      await expect(service.create({ employeeId: 'emp-1', amount: 2000 })).rejects.toThrow(BadRequestException);
    });

    it('should reject if pending advance already exists', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.salaryAdvance.count.mockResolvedValue(1);

      await expect(service.create({ employeeId: 'emp-1', amount: 1000 })).rejects.toThrow(ConflictException);
    });

    it('should throw if employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.create({ employeeId: 'emp-xxx', amount: 1000 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a requested advance', async () => {
      prisma.salaryAdvance.findUnique.mockResolvedValue(mockAdvance);
      prisma.salaryAdvance.update.mockImplementation((d: any) => Promise.resolve({ ...mockAdvance, ...d.data, status: 'approved' }));

      const result = await service.approve('adv-1', 'user-1');

      expect(result.status).toBe('approved');
      expect(result.approvedBy).toBe('user-1');
    });

    it('should reject approving a non-requested advance', async () => {
      prisma.salaryAdvance.findUnique.mockResolvedValue({ ...mockAdvance, status: 'rejected' });

      await expect(service.approve('adv-1', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a requested advance', async () => {
      prisma.salaryAdvance.findUnique.mockResolvedValue(mockAdvance);
      prisma.salaryAdvance.update.mockResolvedValue({ ...mockAdvance, status: 'rejected' });

      const result = await service.reject('adv-1');

      expect(result.status).toBe('rejected');
    });

    it('should reject if advance not found', async () => {
      prisma.salaryAdvance.findUnique.mockResolvedValue(null);

      await expect(service.reject('adv-xxx')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markPaid', () => {
    it('should mark approved advance as paid with future repayment date', async () => {
      const approved = { ...mockAdvance, status: 'approved' };
      prisma.salaryAdvance.findUnique.mockResolvedValue(approved);
      prisma.salaryAdvance.update.mockImplementation((d: any) => Promise.resolve({ ...approved, ...d.data, status: 'paid' }));

      const result = await service.markPaid('adv-1');

      expect(result.status).toBe('paid');
      expect(result.paidAt).toBeDefined();
      expect(result.repaymentDate).toBeDefined();
      expect(result.repaymentAmount).toBe(1000);
    });

    it('should reject if not approved', async () => {
      prisma.salaryAdvance.findUnique.mockResolvedValue({ ...mockAdvance, status: 'requested' });

      await expect(service.markPaid('adv-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('markRepaid', () => {
    it('should mark paid advance as repaid', async () => {
      const paid = { ...mockAdvance, status: 'paid', repaymentStatus: 'pending' };
      prisma.salaryAdvance.findUnique.mockResolvedValue(paid);
      prisma.salaryAdvance.update.mockResolvedValue({ ...paid, repaymentStatus: 'repaid' });

      const result = await service.markRepaid('adv-1');

      expect(result.repaymentStatus).toBe('repaid');
    });

    it('should reject if not paid', async () => {
      prisma.salaryAdvance.findUnique.mockResolvedValue(mockAdvance);

      await expect(service.markRepaid('adv-1')).rejects.toThrow(BadRequestException);
    });

    it('should reject if repayment already completed', async () => {
      prisma.salaryAdvance.findUnique.mockResolvedValue({ ...mockAdvance, status: 'paid', repaymentStatus: 'repaid' });

      await expect(service.markRepaid('adv-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCompany', () => {
    it('should return advances for a company', async () => {
      prisma.salaryAdvance.findMany.mockResolvedValue([mockAdvance]);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.salaryAdvance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { employee: { companyId: 'comp-1' } },
        }),
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return advances for an employee', async () => {
      prisma.salaryAdvance.findMany.mockResolvedValue([mockAdvance]);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.salaryAdvance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { employeeId: 'emp-1' } }),
      );
    });
  });
});
