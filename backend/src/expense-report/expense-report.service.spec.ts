import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExpenseReportService } from './expense-report.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExpenseReportService', () => {
  let service: ExpenseReportService;
  let prisma: any;

  const mockExpenseReport = {
    id: 'exp-1',
    employeeId: 'emp-1',
    companyId: 'comp-1',
    title: 'Hotel stay',
    category: 'accommodation',
    amount: 500,
    currency: 'EUR',
    status: 'pending',
    receiptUrl: null,
    missionId: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: new Date('2026-07-01'),
  };

  beforeEach(async () => {
    prisma = {
      expenseReport: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseReportService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ExpenseReportService>(ExpenseReportService);
  });

  describe('create', () => {
    const createDto = {
      employeeId: 'emp-1',
      companyId: 'comp-1',
      title: 'Hotel stay',
      category: 'accommodation',
      amount: 500,
      currency: 'EUR',
    };

    it('should create an expense report successfully', async () => {
      prisma.expenseReport.create.mockResolvedValue(mockExpenseReport);

      const result = await service.create(createDto);

      expect(result).toEqual(mockExpenseReport);
      expect(prisma.expenseReport.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw BadRequestException when amount is zero', async () => {
      const invalidDto = { ...createDto, amount: 0 };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is negative', async () => {
      const invalidDto = { ...createDto, amount: -10 };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    const approveDto = { approvedBy: 'manager-1' };

    it('should approve a pending expense report', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue(mockExpenseReport);
      prisma.expenseReport.update.mockResolvedValue({
        ...mockExpenseReport,
        status: 'approved',
        approvedBy: 'manager-1',
        approvedAt: expect.any(Date),
      });

      const result = await service.approve('exp-1', approveDto);

      expect(result.status).toBe('approved');
      expect(prisma.expenseReport.update).toHaveBeenCalledWith({
        where: { id: 'exp-1' },
        data: { status: 'approved', approvedBy: 'manager-1', approvedAt: expect.any(Date) },
      });
    });

    it('should throw BadRequestException when approving already approved expense', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue({ ...mockExpenseReport, status: 'approved' });

      await expect(service.approve('exp-1', approveDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when approving a rejected expense', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue({ ...mockExpenseReport, status: 'rejected' });

      await expect(service.approve('exp-1', approveDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when expense report does not exist', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue(null);

      await expect(service.approve('nonexistent', approveDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    const rejectDto = { reason: 'Receipt missing' };

    it('should reject a pending expense report with reason', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue(mockExpenseReport);
      prisma.expenseReport.update.mockResolvedValue({
        ...mockExpenseReport,
        status: 'rejected',
        rejectionReason: 'Receipt missing',
      });

      const result = await service.reject('exp-1', rejectDto);

      expect(result.status).toBe('rejected');
      expect(result.rejectionReason).toBe('Receipt missing');
      expect(prisma.expenseReport.update).toHaveBeenCalledWith({
        where: { id: 'exp-1' },
        data: { status: 'rejected', rejectionReason: 'Receipt missing' },
      });
    });

    it('should throw BadRequestException when rejecting already rejected expense', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue({ ...mockExpenseReport, status: 'rejected' });

      await expect(service.reject('exp-1', rejectDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when rejecting an approved expense', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue({ ...mockExpenseReport, status: 'approved' });

      await expect(service.reject('exp-1', rejectDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadReceipt', () => {
    const receiptDto = { url: 'https://receipts.example.com/rec-123.pdf' };

    it('should update receipt URL', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue(mockExpenseReport);
      prisma.expenseReport.update.mockResolvedValue({
        ...mockExpenseReport,
        receiptUrl: 'https://receipts.example.com/rec-123.pdf',
      });

      const result = await service.uploadReceipt('exp-1', receiptDto);

      expect(result.receiptUrl).toBe('https://receipts.example.com/rec-123.pdf');
      expect(prisma.expenseReport.update).toHaveBeenCalledWith({
        where: { id: 'exp-1' },
        data: { receiptUrl: 'https://receipts.example.com/rec-123.pdf' },
      });
    });

    it('should throw NotFoundException when expense does not exist', async () => {
      prisma.expenseReport.findUnique.mockResolvedValue(null);

      await expect(service.uploadReceipt('nonexistent', receiptDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCompany', () => {
    it('should return expense reports for a company', async () => {
      const expenses = [
        { ...mockExpenseReport, id: 'e1' },
        { ...mockExpenseReport, id: 'e2' },
      ];
      prisma.expenseReport.findMany.mockResolvedValue(expenses);

      const result = await service.findByCompany('comp-1');

      expect(result).toEqual(expenses);
      expect(prisma.expenseReport.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no expenses exist', async () => {
      prisma.expenseReport.findMany.mockResolvedValue([]);

      const result = await service.findByCompany('comp-other');

      expect(result).toEqual([]);
    });
  });

  describe('findByEmployee', () => {
    it('should return expense reports for an employee', async () => {
      const expenses = [{ ...mockExpenseReport, id: 'e1' }];
      prisma.expenseReport.findMany.mockResolvedValue(expenses);

      const result = await service.findByEmployee('emp-1');

      expect(result).toEqual(expenses);
      expect(prisma.expenseReport.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByMission', () => {
    it('should return expense reports for a mission', async () => {
      const expenses = [{ ...mockExpenseReport, id: 'e1', missionId: 'mission-1' }];
      prisma.expenseReport.findMany.mockResolvedValue(expenses);

      const result = await service.findByMission('mission-1');

      expect(result).toEqual(expenses);
      expect(prisma.expenseReport.findMany).toHaveBeenCalledWith({
        where: { missionId: 'mission-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no expenses linked to mission', async () => {
      prisma.expenseReport.findMany.mockResolvedValue([]);

      const result = await service.findByMission('mission-nonexistent');

      expect(result).toEqual([]);
    });
  });
});
