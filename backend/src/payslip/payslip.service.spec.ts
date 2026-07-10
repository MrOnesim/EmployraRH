import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PayslipService } from './payslip.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayslipService', () => {
  let service: PayslipService;
  let prisma: any;

  const mockEmployee = { id: 'emp-1', companyId: 'comp-1', salary: 5000, company: { id: 'comp-1', name: 'Test Corp' } };
  const mockConfig = { companyId: 'comp-1', taxRate: 0.15, socialChargesRate: 0.10, currency: 'EUR' };
  const mockPayslip = { id: 'payslip-1', employeeId: 'emp-1', month: 7, year: 2026, grossSalary: 5000, netSalary: 3750 };

  beforeEach(async () => {
    prisma = {
      employee: { findUnique: vi.fn() },
      payslip: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
      payrollConfig: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayslipService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayslipService>(PayslipService);
  });

  describe('generate', () => {
    it('should generate a payslip with correct net salary calculation', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.payslip.findUnique.mockResolvedValue(null);
      prisma.payrollConfig.findUnique.mockResolvedValue(mockConfig);
      prisma.payslip.create.mockImplementation((d: any) => Promise.resolve({ id: 'payslip-1', ...d.data }));

      const result = await service.generate('emp-1', 7, 2026);

      expect(result).toBeDefined();
      expect(result.netSalary).toBe(3750);
      expect(prisma.payslip.create).toHaveBeenCalledWith({
        data: { employeeId: 'emp-1', month: 7, year: 2026, grossSalary: 5000, netSalary: 3750 },
      });
    });

    it('should throw ConflictException when payslip already exists', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.payslip.findUnique.mockResolvedValue(mockPayslip);

      await expect(service.generate('emp-1', 7, 2026)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.generate('emp-1', 7, 2026)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when company has no payroll config', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.payslip.findUnique.mockResolvedValue(null);
      prisma.payrollConfig.findUnique.mockResolvedValue(null);

      await expect(service.generate('emp-1', 7, 2026)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when net salary is negative', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.payslip.findUnique.mockResolvedValue(null);
      prisma.payrollConfig.findUnique.mockResolvedValue({ ...mockConfig, taxRate: 0.6, socialChargesRate: 0.5 });

      await expect(service.generate('emp-1', 7, 2026)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCompany', () => {
    it('should return payslips filtered by company', async () => {
      prisma.payslip.findMany.mockResolvedValue([{ ...mockPayslip, employee: mockEmployee }]);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.payslip.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' } },
        include: { employee: true },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
    });

    it('should return empty array when no payslips exist for company', async () => {
      prisma.payslip.findMany.mockResolvedValue([]);

      const result = await service.findByCompany('comp-2');

      expect(result).toEqual([]);
    });
  });

  describe('findByEmployee', () => {
    it('should return payslips filtered by employee', async () => {
      prisma.payslip.findMany.mockResolvedValue([mockPayslip]);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.payslip.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
    });
  });

  describe('findByEmployeeAndPeriod', () => {
    it('should return a specific payslip', async () => {
      prisma.payslip.findUnique.mockResolvedValue({ ...mockPayslip, employee: mockEmployee });

      const result = await service.findByEmployeeAndPeriod('emp-1', 7, 2026);

      expect(result).toBeDefined();
      expect(result.employeeId).toBe('emp-1');
      expect(prisma.payslip.findUnique).toHaveBeenCalledWith({
        where: { employeeId_month_year: { employeeId: 'emp-1', month: 7, year: 2026 } },
        include: { employee: true },
      });
    });

    it('should throw NotFoundException when payslip not found', async () => {
      prisma.payslip.findUnique.mockResolvedValue(null);

      await expect(service.findByEmployeeAndPeriod('emp-1', 7, 2026)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a payslip by id', async () => {
      prisma.payslip.findUnique.mockResolvedValue({ ...mockPayslip, employee: mockEmployee });

      const result = await service.findById('payslip-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('payslip-1');
    });

    it('should throw NotFoundException when id not found', async () => {
      prisma.payslip.findUnique.mockResolvedValue(null);

      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
