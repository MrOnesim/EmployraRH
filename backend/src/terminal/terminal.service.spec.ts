import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TerminalService', () => {
  let service: TerminalService;
  let prisma: any;

  const mockTerminal = {
    id: 'term-1',
    name: 'Main Entrance',
    deviceFingerprint: 'DF-ABC123',
    apiKey: 'some-api-key',
    companyId: 'comp-1',
    isActive: true,
    lastSeenAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      terminal: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerminalService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TerminalService>(TerminalService);
  });

  describe('register', () => {
    it('should register a new terminal', async () => {
      prisma.terminal.findUnique.mockResolvedValue(null);
      prisma.terminal.create.mockResolvedValue(mockTerminal);
      const result = await service.register('comp-1', { name: 'Main Entrance', deviceFingerprint: 'DF-ABC123' });
      expect(result).toEqual(mockTerminal);
    });

    it('should throw when device fingerprint already exists', async () => {
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      await expect(service.register('comp-1', { name: 'Duplicate', deviceFingerprint: 'DF-ABC123' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findByCompany', () => {
    it('should return terminals for a company', async () => {
      prisma.terminal.findMany.mockResolvedValue([mockTerminal]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a terminal by id', async () => {
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      const result = await service.findById('term-1');
      expect(result.id).toBe('term-1');
    });

    it('should throw when not found', async () => {
      prisma.terminal.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should activate a terminal', async () => {
      prisma.terminal.findUnique.mockResolvedValue({ ...mockTerminal, isActive: false });
      prisma.terminal.update.mockResolvedValue({ ...mockTerminal, isActive: true });
      const result = await service.activate('term-1');
      expect(result.isActive).toBe(true);
    });

    it('should throw when terminal not found', async () => {
      prisma.terminal.findUnique.mockResolvedValue(null);
      await expect(service.activate('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a terminal', async () => {
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      prisma.terminal.update.mockResolvedValue({ ...mockTerminal, isActive: false });
      const result = await service.deactivate('term-1');
      expect(result.isActive).toBe(false);
    });

    it('should throw when terminal not found', async () => {
      prisma.terminal.findUnique.mockResolvedValue(null);
      await expect(service.deactivate('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLastSeen', () => {
    it('should update the lastSeenAt timestamp', async () => {
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      prisma.terminal.update.mockResolvedValue({ ...mockTerminal, lastSeenAt: new Date() });
      const result = await service.updateLastSeen('term-1');
      expect(result.lastSeenAt).toBeDefined();
    });

    it('should throw when terminal not found', async () => {
      prisma.terminal.findUnique.mockResolvedValue(null);
      await expect(service.updateLastSeen('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByFingerprint', () => {
    it('should return terminal by device fingerprint', async () => {
      prisma.terminal.findUnique.mockResolvedValue(mockTerminal);
      const result = await service.getByFingerprint('DF-ABC123');
      expect(result.id).toBe('term-1');
    });

    it('should throw when not found', async () => {
      prisma.terminal.findUnique.mockResolvedValue(null);
      await expect(service.getByFingerprint('DF-UNKNOWN')).rejects.toThrow(NotFoundException);
    });
  });
});
