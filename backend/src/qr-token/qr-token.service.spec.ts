import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QrTokenService } from './qr-token.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QrTokenService', () => {
  let service: QrTokenService;
  let prisma: any;

  const mockEmployee = {
    id: 'emp-1',
    companyId: 'comp-1',
    qrToken: 'emp-1.comp-1.9999999999.abcdef',
    qrTokenExpiresAt: new Date(Date.now() + 45000),
  };

  beforeEach(async () => {
    prisma = {
      employee: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrTokenService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: vi.fn(), verify: vi.fn() } },
      ],
    }).compile();

    service = module.get<QrTokenService>(QrTokenService);
  });

  describe('generateForEmployee', () => {
    it('should generate a token successfully', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.employee.update.mockResolvedValue(mockEmployee);
      const result = await service.generateForEmployee('emp-1', 'comp-1');
      expect(result.token).toBeDefined();
      expect(result.token.split('.')).toHaveLength(4);
      expect(result.expiresInMs).toBe(45000);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.generateForEmployee('emp-unknown', 'comp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.employee.update.mockResolvedValue(mockEmployee);
      const result = await service.refreshToken('emp-1', 'comp-1');
      expect(result.token).toBeDefined();
      expect(result.token.split('.')).toHaveLength(4);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.refreshToken('emp-unknown', 'comp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmployee', () => {
    it('should return token for employee', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      const result = await service.findByEmployee('emp-1');
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.findByEmployee('emp-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw when no active token', async () => {
      prisma.employee.findUnique.mockResolvedValue({ ...mockEmployee, qrToken: null, qrTokenExpiresAt: null });
      await expect(service.findByEmployee('emp-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when token expired', async () => {
      prisma.employee.findUnique.mockResolvedValue({ ...mockEmployee, qrTokenExpiresAt: new Date(Date.now() - 1000) });
      await expect(service.findByEmployee('emp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateToken', () => {
    it('should return invalid for malformed token', async () => {
      const result = await service.validateToken('too-short');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('format');
    });

    it('should return invalid for bad signature', async () => {
      const result = await service.validateToken('emp-1.comp-1.9999999999.badsignature');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('signature');
    });

    it('should return invalid for expired token', async () => {
      const result = await service.validateToken('emp-1.comp-1.1.badsignature');
      expect(result.valid).toBe(false);
    });
  });
});
