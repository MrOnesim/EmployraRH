import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { QrTokenService } from '../qr-token/qr-token.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: any;
  let qrToken: any;

  const mockGuard = { id: 'guard-1', employeeId: 'emp-guard', companyId: 'comp-1', isActive: true };
  const mockTerminal = { id: 'term-1', deviceFingerprint: 'DF-TEST123', isActive: true };
  const mockEmployee = { id: 'emp-1', companyId: 'comp-1' };

  beforeEach(async () => {
    prisma = {
      securityGuard: { findUnique: vi.fn() },
      terminal: { findUnique: vi.fn(), update: vi.fn() },
      attendance: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    };

    qrToken = {
      validateToken: vi.fn(),
      generateToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: QrTokenService, useValue: qrToken },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  const validToken = 'emp-1.comp-1.9999999999.abcdef';

  function mockDefaults() {
    prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
    prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
    qrToken.validateToken.mockReturnValue({ valid: true, employeeId: 'emp-1', companyId: 'comp-1' });
    prisma.attendance.findFirst.mockResolvedValue(null);
    prisma.attendance.count.mockResolvedValue(0);
    prisma.attendance.create.mockImplementation((d: any) => Promise.resolve({ id: 'att-1', ...d.data }));
  }

  describe('scanWithGuard', () => {
    const params = {
      qrToken: validToken,
      guardId: 'guard-1',
      terminalId: 'term-1',
      deviceFingerprint: 'DF-TEST123',
      scanMethod: 'qr',
    };

    it('should succeed with valid inputs', async () => {
      mockDefaults();

      const result = await service.scanWithGuard(params);

      expect(result).toBeDefined();
      expect(prisma.attendance.create).toHaveBeenCalled();
      expect(result.employeeId).toBe('emp-1');
    });

    it('should reject inactive guard', async () => {
      mockDefaults();
      prisma.securityGuard.findUnique.mockResolvedValue({ ...mockGuard, isActive: false });

      await expect(service.scanWithGuard(params)).rejects.toThrow(NotFoundException);
    });

    it('should reject inactive terminal', async () => {
      mockDefaults();
      prisma.terminal.findUnique.mockResolvedValue({ ...mockTerminal, isActive: false });

      await expect(service.scanWithGuard(params)).rejects.toThrow(NotFoundException);
    });

    it('should reject device fingerprint mismatch', async () => {
      mockDefaults();
      prisma.terminal.findUnique.mockResolvedValue({ ...mockTerminal, deviceFingerprint: 'DF-OTHER' });

      await expect(service.scanWithGuard(params)).rejects.toThrow(ForbiddenException);
    });

    it('should reject expired token', async () => {
      mockDefaults();
      qrToken.validateToken.mockReturnValue({ valid: false, reason: 'Token expired', employeeId: '', companyId: '' });

      await expect(service.scanWithGuard(params)).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid token signature', async () => {
      mockDefaults();
      qrToken.validateToken.mockReturnValue({ valid: false, reason: 'Invalid token signature', employeeId: '', companyId: '' });

      await expect(service.scanWithGuard(params)).rejects.toThrow(BadRequestException);
    });

    it('should enforce cooldown (30s)', async () => {
      mockDefaults();
      const recentScan = { id: 'att-0', verifiedById: 'guard-1', createdAt: new Date(Date.now() - 5000), clockIn: new Date(), clockOut: null, status: 'present' };
      prisma.attendance.findFirst.mockResolvedValue(recentScan);

      await expect(service.scanWithGuard(params)).rejects.toThrow(/Cooldown/);
    });

    it('should allow scan after cooldown', async () => {
      mockDefaults();
      const oldScan = { id: 'att-0', verifiedById: 'guard-1', createdAt: new Date(Date.now() - 35000), clockIn: new Date(), clockOut: null, status: 'present' };
      prisma.attendance.findFirst.mockResolvedValue(oldScan);
      prisma.attendance.update.mockResolvedValue({ id: 'att-1', clockIn: new Date(), clockOut: new Date(), status: 'present' });

      const result = await service.scanWithGuard(params);
      expect(result).toBeDefined();
    });

    it('should clock out on second scan (entry → exit)', async () => {
      mockDefaults();
      const existing = { id: 'att-1', verifiedById: 'guard-1', createdAt: new Date(Date.now() - 36000), clockIn: new Date(), clockOut: null, status: 'present', employeeId: 'emp-1' };
      prisma.attendance.findFirst.mockResolvedValue(existing);
      prisma.attendance.update.mockResolvedValue({ id: 'att-1', clockIn: existing.clockIn, clockOut: new Date(), status: 'present' });

      const result = await service.scanWithGuard(params);

      expect(prisma.attendance.update).toHaveBeenCalled();
      expect(prisma.attendance.create).not.toHaveBeenCalled();
      expect(result.clockOut).toBeDefined();
    });

    it('should detect anomaly (too many scans)', async () => {
      mockDefaults();
      prisma.attendance.count.mockResolvedValue(10);

      await expect(service.scanWithGuard(params)).rejects.toThrow(/Anomaly/);
    });

    it('should reject scan by different guard than last', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      qrToken.validateToken.mockReturnValue({ valid: true, employeeId: 'emp-1', companyId: 'comp-1' });
      prisma.attendance.findFirst.mockResolvedValue({
        id: 'att-0', verifiedById: 'guard-other',
        createdAt: new Date(Date.now() - 60000),
        clockIn: new Date(), clockOut: null, status: 'present',
      });

      await expect(service.scanWithGuard(params)).rejects.toThrow(/another guard/);
    });
  });
});
