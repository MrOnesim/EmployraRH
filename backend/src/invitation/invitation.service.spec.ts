import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvitationService', () => {
  let service: InvitationService;
  let prisma: any;

  const mockInvitation = {
    id: 'inv-1',
    email: 'test@test.com',
    role: 'EMPLOYEE',
    token: 'abc123def456',
    status: 'pending',
    companyId: 'comp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    prisma = {
      invitation: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
      user: { findUnique: vi.fn() },
      member: { create: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
  });

  describe('create', () => {
    it('should create an invitation with default EMPLOYEE role', async () => {
      prisma.invitation.create.mockResolvedValue(mockInvitation);
      const result = await service.create('test@test.com', 'comp-1');
      expect(result).toEqual(mockInvitation);
      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'test@test.com', companyId: 'comp-1', role: 'EMPLOYEE' }),
      });
    });

    it('should create an invitation with custom role', async () => {
      prisma.invitation.create.mockResolvedValue({ ...mockInvitation, role: 'ADMIN' });
      const result = await service.create('admin@test.com', 'comp-1', 'ADMIN');
      expect(result.role).toBe('ADMIN');
    });

    it('should generate a token', async () => {
      let savedData: any;
      prisma.invitation.create.mockImplementation((d: any) => {
        savedData = d.data;
        return Promise.resolve(mockInvitation);
      });
      await service.create('test@test.com', 'comp-1');
      expect(savedData.token).toBeDefined();
      expect(savedData.token.length).toBe(64);
    });
  });

  describe('accept', () => {
    it('should accept a pending invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockInvitation);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.member.create.mockResolvedValue({});
      prisma.invitation.update.mockResolvedValue({ ...mockInvitation, status: 'accepted' });

      const result = await service.accept('inv-1');
      expect(result.status).toBe('accepted');
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', companyId: 'comp-1', role: 'EMPLOYEE' },
      });
    });

    it('should throw NotFoundException when invitation not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);
      await expect(service.accept('inv-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invitation already processed', async () => {
      prisma.invitation.findUnique.mockResolvedValue({ ...mockInvitation, status: 'accepted' });
      await expect(service.accept('inv-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockInvitation);
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.accept('inv-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCompany', () => {
    it('should return invitations for a company', async () => {
      prisma.invitation.findMany.mockResolvedValue([mockInvitation]);
      const result = await service.findByCompany('comp-1');
      expect(result).toEqual([mockInvitation]);
      expect(prisma.invitation.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty list when no invitations', async () => {
      prisma.invitation.findMany.mockResolvedValue([]);
      const result = await service.findByCompany('comp-1');
      expect(result).toEqual([]);
    });
  });
});
