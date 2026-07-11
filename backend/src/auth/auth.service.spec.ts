import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
  genSalt: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let mailService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$12$hashedpassword',
    emailVerified: true,
    members: [{ id: 'm1', companyId: 'c1', role: 'ADMIN', company: { id: 'c1', name: 'Test Co' } }],
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      session: { deleteMany: vi.fn() },
      refreshToken: { updateMany: vi.fn() },
      $transaction: vi.fn((ops: any[]) => Promise.all(ops)),
    };
    mailService = { sendMail: vi.fn().mockResolvedValue({ messageId: 'test' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findUserByEmail('test@example.com');
      expect(result?.email).toBe('test@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null when email not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findUserByEmail('missing@test.com')).resolves.toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user and send welcome email', async () => {
      const input = { email: 'new@test.com', name: 'New User', password: 'hashed' };
      prisma.user.create.mockResolvedValue({ id: 'new-1', ...input });
      const result = await service.createUser(input);
      expect(result.email).toBe('new@test.com');
      expect(prisma.user.create).toHaveBeenCalledWith({ data: input });
      expect(mailService.sendMail).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user with members and companies', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getUserById('user-1');
      expect(result?.members[0].company.name).toBe('Test Co');
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should delete sessions and revoke refresh tokens', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 2 });
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      await service.revokeAllUserSessions('user-1');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password and revoke sessions when current password is valid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed' as never);
      prisma.user.update.mockResolvedValue({ ...mockUser, password: 'new-hashed' });
      prisma.session.deleteMany.mockResolvedValue({ count: 1 });
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      prisma.$transaction = vi.fn((ops: any[]) => Promise.all(ops));

      await service.changePassword('user-1', 'currentPass', 'newPass');
      expect(bcrypt.compare).toHaveBeenCalledWith('currentPass', mockUser.password);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { password: 'new-hashed' } }),
      );
    });

    it('should throw when current password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      await expect(service.changePassword('user-1', 'wrong', 'newPass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when user has no password (OAuth-only)', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: null });
      await expect(service.changePassword('user-1', 'any', 'new')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
