import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { QrTokenService } from '../qr-token/qr-token.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: any;
  let qrTokenService: any;

  const mockGuard = {
    id: 'guard-1',
    employeeId: 'g-emp-1',
    isActive: true,
    assignedAt: new Date(),
  };
  const mockTerminal = {
    id: 'term-1',
    deviceFingerprint: 'fp-1',
    isActive: true,
    lastSeenAt: null,
  };
  const mockEmployee = { id: 'emp-1', firstName: 'John', lastName: 'Doe', companyId: 'c1' };
  const mockTokenResult = { valid: true, employeeId: 'emp-1' };
  const mockAttendance = {
    id: 'att-1',
    employeeId: 'emp-1',
    clockIn: new Date(),
    clockOut: null,
    breakStart: null,
    breakEnd: null,
    status: 'present',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      attendance: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      securityGuard: { findUnique: vi.fn() },
      terminal: { findUnique: vi.fn(), update: vi.fn() },
      employee: { findUnique: vi.fn() },
    };
    qrTokenService = { validateToken: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: QrTokenService, useValue: qrTokenService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  describe('clockIn', () => {
    it('should create an attendance record', async () => {
      prisma.attendance.create.mockResolvedValue(mockAttendance);
      const result = await service.clockIn('emp-1');
      expect(result.id).toBe('att-1');
      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: { employeeId: 'emp-1', clockIn: expect.any(Date) },
      });
    });
  });

  describe('clockOut', () => {
    it('should update clockOut when record exists', async () => {
      prisma.attendance.findUnique.mockResolvedValue(mockAttendance);
      prisma.attendance.update.mockResolvedValue({ ...mockAttendance, clockOut: new Date() });
      const result = await service.clockOut('att-1');
      expect(prisma.attendance.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { clockOut: expect.any(Date) } }),
      );
    });

    it('should throw NotFoundException when record is missing', async () => {
      prisma.attendance.findUnique.mockResolvedValue(null);
      await expect(service.clockOut('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('scanWithGuard', () => {
    const scanParams = {
      qrToken: 'token-1',
      guardId: 'guard-1',
      terminalId: 'term-1',
      deviceFingerprint: 'fp-1',
      ipAddress: '192.168.1.1',
      scanMethod: 'qr',
    };

    it('should reject inactive guard', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue({ ...mockGuard, isActive: false });
      await expect(service.scanWithGuard(scanParams)).rejects.toThrow(NotFoundException);
    });

    it('should reject inactive terminal', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.terminal.findUnique.mockResolvedValue({ ...mockTerminal, isActive: false });
      await expect(service.scanWithGuard(scanParams)).rejects.toThrow(NotFoundException);
    });

    it('should reject device fingerprint mismatch', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.terminal.findUnique.mockResolvedValue({
        ...mockTerminal,
        deviceFingerprint: 'other-fp',
      });
      await expect(service.scanWithGuard(scanParams)).rejects.toThrow(ForbiddenException);
    });

    it('should reject invalid QR token', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      qrTokenService.validateToken.mockResolvedValue({ valid: false, reason: 'Expired token' });
      await expect(service.scanWithGuard(scanParams)).rejects.toThrow(BadRequestException);
    });

    it('should create attendance when no prior scan today', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      qrTokenService.validateToken.mockResolvedValue(mockTokenResult);
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.count.mockResolvedValue(0);
      prisma.attendance.create.mockResolvedValue(mockAttendance);
      prisma.terminal.update.mockResolvedValue(mockTerminal);

      const result = await service.scanWithGuard(scanParams);
      expect(result.id).toBe('att-1');
    });

    it('should clock out when last scan has no clockOut', async () => {
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      qrTokenService.validateToken.mockResolvedValue(mockTokenResult);
      prisma.attendance.findFirst.mockResolvedValue({
        ...mockAttendance,
        clockOut: null,
        verifiedById: 'guard-1',
        createdAt: new Date(Date.now() - 60000),
      });
      prisma.attendance.count.mockResolvedValue(1);
      prisma.attendance.update.mockResolvedValue({ ...mockAttendance, clockOut: new Date() });

      const result = await service.scanWithGuard(scanParams);
      expect(prisma.attendance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att-1' },
          data: expect.objectContaining({ clockOut: expect.any(Date) }),
        }),
      );
    });

    it('should reject scan cooldown', async () => {
      const recent = { ...mockAttendance, createdAt: new Date() };
      prisma.securityGuard.findUnique.mockResolvedValue(mockGuard);
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      qrTokenService.validateToken.mockResolvedValue(mockTokenResult);
      prisma.attendance.findFirst.mockResolvedValue(recent);
      prisma.attendance.count.mockResolvedValue(1);
      await expect(service.scanWithGuard(scanParams)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll / findByEmployee', () => {
    it('should return all attendance for company', async () => {
      prisma.attendance.findMany.mockResolvedValue([mockAttendance]);
      const result = await service.findAll('c1');
      expect(result).toHaveLength(1);
    });

    it('should return attendance by employee', async () => {
      prisma.attendance.findMany.mockResolvedValue([mockAttendance]);
      const result = await service.findByEmployee('emp-1');
      expect(result).toHaveLength(1);
    });
  });
});
