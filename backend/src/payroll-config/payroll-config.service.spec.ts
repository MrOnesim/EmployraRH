import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PayrollConfigService } from './payroll-config.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayrollConfigService', () => {
  let service: PayrollConfigService;
  let prisma: any;

  const mockConfig = { companyId: 'comp-1', taxRate: 0.15, socialChargesRate: 0.10, currency: 'EUR', paymentDay: 15, overtimeRate: 1.5 };

  beforeEach(async () => {
    prisma = {
      payrollConfig: { findUnique: vi.fn(), upsert: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollConfigService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayrollConfigService>(PayrollConfigService);
  });

  describe('findByCompany', () => {
    it('should return config when found', async () => {
      prisma.payrollConfig.findUnique.mockResolvedValue(mockConfig);

      const result = await service.findByCompany('comp-1');

      expect(result).toEqual(mockConfig);
      expect(prisma.payrollConfig.findUnique).toHaveBeenCalledWith({ where: { companyId: 'comp-1' } });
    });

    it('should throw NotFoundException when config not found', async () => {
      prisma.payrollConfig.findUnique.mockResolvedValue(null);

      await expect(service.findByCompany('comp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('should create new config when none exists', async () => {
      const newData = { currency: 'USD', taxRate: 0.2, socialChargesRate: 0.05, paymentDay: 10, overtimeRate: 2 };
      prisma.payrollConfig.upsert.mockResolvedValue({ companyId: 'comp-new', ...newData });

      const result = await service.upsert('comp-new', newData);

      expect(result.currency).toBe('USD');
      expect(prisma.payrollConfig.upsert).toHaveBeenCalledWith({
        where: { companyId: 'comp-new' },
        update: newData,
        create: { companyId: 'comp-new', ...newData },
      });
    });

    it('should update existing config', async () => {
      const updateData = { taxRate: 0.25 };
      prisma.payrollConfig.upsert.mockResolvedValue({ ...mockConfig, ...updateData });

      const result = await service.upsert('comp-1', updateData);

      expect(result.taxRate).toBe(0.25);
    });

    it('should throw BadRequestException when taxRate < 0', async () => {
      await expect(service.upsert('comp-1', { taxRate: -0.1 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when taxRate > 1', async () => {
      await expect(service.upsert('comp-1', { taxRate: 1.5 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when socialChargesRate < 0', async () => {
      await expect(service.upsert('comp-1', { socialChargesRate: -0.1 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when socialChargesRate > 1', async () => {
      await expect(service.upsert('comp-1', { socialChargesRate: 1.5 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when paymentDay < 1', async () => {
      await expect(service.upsert('comp-1', { paymentDay: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when paymentDay > 31', async () => {
      await expect(service.upsert('comp-1', { paymentDay: 32 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when overtimeRate < 1', async () => {
      await expect(service.upsert('comp-1', { overtimeRate: 0.5 })).rejects.toThrow(BadRequestException);
    });

    it('should accept valid boundary values', async () => {
      const boundaryData = { taxRate: 0, socialChargesRate: 1, paymentDay: 1, overtimeRate: 1 };
      prisma.payrollConfig.upsert.mockResolvedValue({ companyId: 'comp-1', ...boundaryData });

      const result = await service.upsert('comp-1', boundaryData);

      expect(result.taxRate).toBe(0);
      expect(result.socialChargesRate).toBe(1);
      expect(result.paymentDay).toBe(1);
    });
  });
});
