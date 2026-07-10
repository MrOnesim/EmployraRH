import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SecurityGuardService } from './security-guard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SecurityGuardService', () => {
  let service: SecurityGuardService;
  let prisma: any;

  const mockGuard = {
    id: 'guard-1',
    employeeId: 'emp-1',
    companyId: 'comp-1',
    isActive: true,
    assignedAt: new Date(),
    employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe' },
  };

  const mockAttendance = {
    id: 'att-1',
    employeeId: 'emp-1',
    verifiedById: 'guard-1',
    clockIn: new Date(),
    employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe' },
    verifiedBy: { id: 'guard-1', employee: { id: 'emp-1' } },
  };

  beforeEach(async () => {
    prisma = {
      securityGuard: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      employee: { findUnique: vi.fn() },
      attendance: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityGuardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SecurityGuardService>(SecurityGuardService);
  });

  describe('assign', () => {
    it('should assign a security guard', async () => {
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.securityGuard.findUnique.mockResolvedValue(null);
      prisma.securityGuard.create.mockResolvedValue(mockGuard);
      const result = await service.assign('comp-1', 'emp-1');
      expect(result).toEqual(mockGuard);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.assign('comp-1', 'emp-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw when already a guard', async () => {
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      await expect(service.assign('comp-1', 'emp-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should deactivate a guard (soft delete)', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.securityGuard.update.mockResolvedValue({ ...mockGuard, isActive: false });
      const result = await service.remove('guard-1');
      expect(result.isActive).toBe(false);
    });

    it('should throw when guard not found', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(null);
      await expect(service.remove('guard-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle guard active status on', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue({ ...mockGuard, isActive: false });
      prisma.securityGuard.update.mockResolvedValue({ ...mockGuard, isActive: true });
      const result = await service.toggleActive('guard-1');
      expect(result.isActive).toBe(true);
    });

    it('should toggle guard active status off', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.securityGuard.update.mockResolvedValue({ ...mockGuard, isActive: false });
      const result = await service.toggleActive('guard-1');
      expect(result.isActive).toBe(false);
    });

    it('should throw when guard not found', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(null);
      await expect(service.toggleActive('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCompany', () => {
    it('should return guards for a company', async () => {
      prisma.securityGuard.findMany.mockResolvedValue([mockGuard]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByEmployee', () => {
    it('should return guard by employee and company', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      const result = await service.findByEmployee('emp-1', 'comp-1');
      expect(result).toEqual(mockGuard);
    });
  });

  describe('getScanHistory', () => {
    it('should return scan history for a guard', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.attendance.findMany.mockResolvedValue([mockAttendance]);
      const result = await service.getScanHistory('guard-1');
      expect(result).toHaveLength(1);
    });

    it('should throw when guard not found', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(null);
      await expect(service.getScanHistory('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('scanAttendance', () => {
    it('should create an attendance record', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.attendance.create.mockResolvedValue(mockAttendance);
      const result = await service.scanAttendance('guard-1', 'emp-1');
      expect(result).toEqual(mockAttendance);
    });

    it('should throw when guard not found', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(null);
      await expect(service.scanAttendance('guard-unknown', 'emp-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when guard is inactive', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue({ ...mockGuard, isActive: false });
      await expect(service.scanAttendance('guard-1', 'emp-1')).rejects.toThrow(NotFoundException);
    });
  });
});
