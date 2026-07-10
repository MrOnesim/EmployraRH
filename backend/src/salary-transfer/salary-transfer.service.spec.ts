import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SalaryTransferService } from './salary-transfer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SalaryTransferService', () => {
  let service: SalaryTransferService;
  let prisma: any;

  const mockTransfer = {
    id: 'transfer-1',
    employeeId: 'emp-1',
    amount: 3000,
    currency: 'EUR',
    type: 'salary',
    description: 'Monthly salary',
    status: 'pending',
    createdAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      salaryTransfer: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      employee: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaryTransferService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SalaryTransferService>(SalaryTransferService);
  });

  describe('findByCompany', () => {
    it('should return transfers for a company', async () => {
      prisma.salaryTransfer.findMany.mockResolvedValue([mockTransfer]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByEmployee', () => {
    it('should return transfers for an employee', async () => {
      prisma.salaryTransfer.findMany.mockResolvedValue([mockTransfer]);
      const result = await service.findByEmployee('emp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a transfer by id', async () => {
      prisma.salaryTransfer.findUnique.mockResolvedValue(mockTransfer);
      const result = await service.findById('transfer-1');
      expect(result.id).toBe('transfer-1');
    });

    it('should throw when not found', async () => {
      prisma.salaryTransfer.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByType', () => {
    it('should return transfers by type', async () => {
      prisma.salaryTransfer.findMany.mockResolvedValue([mockTransfer]);
      const result = await service.findByType('comp-1', 'salary');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a salary transfer', async () => {
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1', companyId: 'comp-1' });
      prisma.salaryTransfer.create.mockResolvedValue(mockTransfer);
      const result = await service.create({
        employeeId: 'emp-1', amount: 3000, type: 'salary',
      });
      expect(result).toEqual(mockTransfer);
    });

    it('should throw when amount is not positive', async () => {
      await expect(service.create({
        employeeId: 'emp-1', amount: 0, type: 'salary',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.create({
        employeeId: 'emp-unknown', amount: 3000, type: 'salary',
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete a pending transfer', async () => {
      prisma.salaryTransfer.findUnique.mockResolvedValue(mockTransfer);
      prisma.salaryTransfer.update.mockResolvedValue({ ...mockTransfer, status: 'completed', completedAt: new Date() });
      const result = await service.complete('transfer-1');
      expect(result.status).toBe('completed');
    });

    it('should throw when transfer not pending', async () => {
      prisma.salaryTransfer.findUnique.mockResolvedValue({ ...mockTransfer, status: 'completed' });
      await expect(service.complete('transfer-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('fail', () => {
    it('should fail a pending transfer', async () => {
      prisma.salaryTransfer.findUnique.mockResolvedValue(mockTransfer);
      prisma.salaryTransfer.update.mockResolvedValue({ ...mockTransfer, status: 'failed' });
      const result = await service.fail('transfer-1');
      expect(result.status).toBe('failed');
    });

    it('should throw when transfer not pending', async () => {
      prisma.salaryTransfer.findUnique.mockResolvedValue({ ...mockTransfer, status: 'failed' });
      await expect(service.fail('transfer-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when transfer not found', async () => {
      prisma.salaryTransfer.findUnique.mockResolvedValue(null);
      await expect(service.fail('unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
