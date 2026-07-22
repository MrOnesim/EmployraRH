import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceService } from './compliance.service';
import { CountryProviderRegistry } from './providers/provider.registry';
import { FranceProvider } from './providers/france.provider';
import { PrismaService } from '../prisma/prisma.service';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let registry: CountryProviderRegistry;

  const now = new Date('2026-07-01');
  const past = new Date('2025-01-01');

  const mockPrisma = {
    socialContribution: {
      findMany: async () => [
        {
          id: 'c1',
          countryCode: 'FR',
          code: 'URSSAF_MALADIE',
          label: 'URSSAF Maladie',
          type: 'SOCIAL_SECURITY',
          employerRate: 0.13,
          employeeRate: 0.07,
          cap: null,
          effectiveFrom: past,
          effectiveTo: null,
          version: 1,
        },
        {
          id: 'c2',
          countryCode: 'FR',
          code: 'RETRAITE_COMPL',
          label: 'Retraite Complémentaire',
          type: 'PENSION',
          employerRate: 0.08,
          employeeRate: 0.06,
          cap: 4000,
          effectiveFrom: past,
          effectiveTo: null,
          version: 1,
        },
      ],
    },
    taxBracket: {
      findMany: async () => [
        {
          id: 't1',
          countryCode: 'FR',
          type: 'IRPP',
          minIncome: 0,
          maxIncome: 2000,
          rate: 0,
          deduction: 0,
          effectiveFrom: past,
          effectiveTo: null,
          version: 1,
        },
        {
          id: 't2',
          countryCode: 'FR',
          type: 'IRPP',
          minIncome: 2000,
          maxIncome: 5000,
          rate: 0.11,
          deduction: 0,
          effectiveFrom: past,
          effectiveTo: null,
          version: 1,
        },
        {
          id: 't3',
          countryCode: 'FR',
          type: 'IRPP',
          minIncome: 5000,
          maxIncome: null,
          rate: 0.3,
          deduction: 0,
          effectiveFrom: past,
          effectiveTo: null,
          version: 1,
        },
      ],
    },
    leaveRule: {
      findMany: async () => [
        {
          id: 'l1',
          countryCode: 'FR',
          type: 'ANNUAL',
          label: 'Congés payés',
          daysEntitled: 25,
          accrualRate: 2.08,
          seniorityExtraDays: 0,
          maxConsecutiveDays: null,
          paidByEmployerPct: 1,
          requiresMedicalCert: false,
          effectiveFrom: past,
          effectiveTo: null,
        },
      ],
    },
    publicHoliday: {
      findMany: async () => [
        {
          id: 'h1',
          countryCode: 'FR',
          date: new Date('2026-01-01'),
          name: "Jour de l'an",
          isRecurring: true,
          year: null,
        },
        {
          id: 'h2',
          countryCode: 'FR',
          date: new Date('2026-05-01'),
          name: 'Fête du travail',
          isRecurring: true,
          year: null,
        },
      ],
    },
    minimumWage: {
      findMany: async () => [
        {
          id: 'm1',
          countryCode: 'FR',
          amount: 1801.8,
          period: 'MONTHLY',
          category: null,
          effectiveFrom: past,
          effectiveTo: null,
        },
      ],
    },
    country: {
      findUnique: async () => ({
        code: 'FR',
        name: 'France',
        currency: 'EUR',
        region: 'EUROPE',
        active: true,
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        CountryProviderRegistry,
        FranceProvider,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
    registry = module.get<CountryProviderRegistry>(CountryProviderRegistry);
    const franceProvider = module.get<FranceProvider>(FranceProvider);
    registry.register(franceProvider);
  });

  describe('getSupportedCountries', () => {
    it('should return list of supported country codes', () => {
      const countries = service.getSupportedCountries();
      expect(countries).toContain('FR');
    });
  });

  describe('calculatePayslip', () => {
    it('should calculate a payslip for France with correct structure', async () => {
      const result = await service.calculatePayslip('emp-1', 7, 2026, 5000, 'FR');

      expect(result).toBeDefined();
      expect(result.countryCode).toBe('FR');
      expect(result.result).toBeDefined();
      expect(result.result.grossSalary).toBe(5000);
      expect(result.result.netPayable).toBeGreaterThan(0);
      expect(result.result.netPayable).toBeLessThan(5000);
      expect(result.result.contributions).toBeDefined();
      expect(result.result.taxBracketsApplied).toBeDefined();
      expect(result.result.metadata.countryCode).toBe('FR');
    });

    it('should throw for unsupported country', async () => {
      await expect(service.calculatePayslip('emp-1', 7, 2026, 5000, 'XX')).rejects.toThrow();
    });

    it('should calculate contributions and income tax', async () => {
      const result = await service.calculatePayslip('emp-1', 7, 2026, 5000, 'FR');

      expect(result.result.totalEmployeeContributions).toBeGreaterThan(0);
      expect(result.result.contributions.length).toBeGreaterThan(0);

      const firstContribution = result.result.contributions[0];
      expect(firstContribution).toHaveProperty('code');
      expect(firstContribution).toHaveProperty('label');
      expect(firstContribution).toHaveProperty('employerAmount');
      expect(firstContribution).toHaveProperty('employeeAmount');
    });

    it('should handle zero gross salary', async () => {
      const result = await service.calculatePayslip('emp-1', 7, 2026, 0, 'FR');

      expect(result.result.grossSalary).toBe(0);
      expect(result.result.netPayable).toBe(0);
      expect(result.result.totalEmployeeContributions).toBe(0);
      expect(result.result.incomeTax).toBe(0);
    });

    it('should return correct contribution breakdown amounts', async () => {
      const result = await service.calculatePayslip('emp-1', 7, 2026, 5000, 'FR');

      const urssaf = result.result.contributions.find((c) => c.code === 'URSSAF_MALADIE');
      expect(urssaf).toBeDefined();
      expect(urssaf!.employeeAmount).toBe(350);
      expect(urssaf!.employerAmount).toBe(650);

      const retraite = result.result.contributions.find((c) => c.code === 'RETRAITE_COMPL');
      expect(retraite).toBeDefined();
      expect(retraite!.employeeAmount).toBe(300);
    });
  });

  describe('getLeaveEntitlements', () => {
    it('should return leave entitlements for France', async () => {
      const leaves = await service.getLeaveEntitlements('FR', new Date('2020-01-01'));

      expect(leaves).toBeDefined();
      expect(leaves.length).toBeGreaterThan(0);
      const annualLeave = leaves.find((l) => l.type === 'ANNUAL');
      expect(annualLeave).toBeDefined();
      expect(annualLeave!.daysEntitled).toBe(25);
    });
  });

  describe('getPublicHolidays', () => {
    it('should return public holidays for France', async () => {
      const holidays = await service.getPublicHolidays('FR', 2026);

      expect(holidays).toBeDefined();
      expect(holidays.length).toBe(2);
      expect(holidays[0]).toHaveProperty('date');
      expect(holidays[0]).toHaveProperty('name');
    });
  });
});
