import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TaxDeclarationService } from './tax-declaration.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TaxDeclarationService', () => {
  let service: TaxDeclarationService;
  let prisma: any;

  const mockDeclaration = {
    id: 'tax-1',
    companyId: 'comp-1',
    employeeId: 'emp-1',
    year: 2026,
    taxType: 'income',
    taxableIncome: 50000,
    taxWithheld: 8000,
    confirmedAmount: null,
    declarationDate: new Date('2026-03-01'),
    dueDate: new Date('2026-05-31'),
    status: 'draft',
    notes: null,
  };

  beforeEach(async () => {
    prisma = {
      taxDeclaration: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      employee: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxDeclarationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TaxDeclarationService>(TaxDeclarationService);
  });

  describe('findByCompany', () => {
    it('should return declarations for a company', async () => {
      prisma.taxDeclaration.findMany.mockResolvedValue([mockDeclaration]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a declaration by id', async () => {
      prisma.taxDeclaration.findUnique.mockResolvedValue(mockDeclaration);
      const result = await service.findById('tax-1');
      expect(result.id).toBe('tax-1');
    });

    it('should throw when not found', async () => {
      prisma.taxDeclaration.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByYear', () => {
    it('should return declarations for a year', async () => {
      prisma.taxDeclaration.findMany.mockResolvedValue([mockDeclaration]);
      const result = await service.findByYear('comp-1', 2026);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByType', () => {
    it('should return declarations by tax type', async () => {
      prisma.taxDeclaration.findMany.mockResolvedValue([mockDeclaration]);
      const result = await service.findByType('comp-1', 'income');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a tax declaration', async () => {
      prisma.taxDeclaration.create.mockResolvedValue(mockDeclaration);
      const result = await service.create({
        companyId: 'comp-1', employeeId: 'emp-1', year: 2026,
        taxType: 'income', taxableIncome: 50000, taxWithheld: 8000,
        declarationDate: new Date('2026-05-01'),
        dueDate: new Date('2026-05-31'),
      });
      expect(result).toEqual(mockDeclaration);
    });

    it('should throw when year is invalid', async () => {
      await expect(service.create({
        companyId: 'comp-1', employeeId: 'emp-1', year: 2020,
        taxType: 'income', taxableIncome: 50000, taxWithheld: 8000,
        dueDate: new Date('2026-05-31'),
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when due date is before declaration date', async () => {
      await expect(service.create({
        companyId: 'comp-1', employeeId: 'emp-1', year: 2026,
        taxType: 'income', taxableIncome: 50000, taxWithheld: 8000,
        declarationDate: new Date('2026-06-01'),
        dueDate: new Date('2026-05-31'),
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    it('should submit a draft declaration', async () => {
      prisma.taxDeclaration.findUnique.mockResolvedValue(mockDeclaration);
      prisma.taxDeclaration.update.mockResolvedValue({ ...mockDeclaration, status: 'submitted' });
      const result = await service.submit('tax-1');
      expect(result.status).toBe('submitted');
    });

    it('should throw when not draft', async () => {
      prisma.taxDeclaration.findUnique.mockResolvedValue({ ...mockDeclaration, status: 'submitted' });
      await expect(service.submit('tax-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmAmount', () => {
    it('should confirm the amount for a declaration', async () => {
      prisma.taxDeclaration.findUnique.mockResolvedValue(mockDeclaration);
      prisma.taxDeclaration.update.mockResolvedValue({ ...mockDeclaration, confirmedAmount: 8000 });
      const result = await service.confirmAmount('tax-1', 8000);
      expect(result.confirmedAmount).toBe(8000);
    });
  });

  describe('markPaid', () => {
    it('should mark a submitted declaration as paid', async () => {
      prisma.taxDeclaration.findUnique.mockResolvedValue({ ...mockDeclaration, status: 'submitted' });
      prisma.taxDeclaration.update.mockResolvedValue({ ...mockDeclaration, status: 'paid', paidAt: new Date() });
      const result = await service.markPaid('tax-1');
      expect(result.status).toBe('paid');
    });

    it('should throw when not submitted', async () => {
      prisma.taxDeclaration.findUnique.mockResolvedValue(mockDeclaration);
      await expect(service.markPaid('tax-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateWithholding', () => {
    it('should calculate withholding for an employee', async () => {
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1', salary: 5000 });
      const result = await service.calculateWithholding('emp-1', 2026);
      expect(result.employeeId).toBe('emp-1');
      expect(result.annualSalary).toBe(60000);
      expect(result.estimatedTax).toBeGreaterThan(0);
    });

    it('should return 0 tax for low income', async () => {
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1', salary: 800 });
      const result = await service.calculateWithholding('emp-1', 2026);
      expect(result.estimatedTax).toBe(0);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.calculateWithholding('emp-unknown', 2026)).rejects.toThrow(NotFoundException);
    });
  });
});
