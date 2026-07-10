import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  const mockUser = { id: 'user-1', email: 'test@example.com', name: 'John Doe', password: 'hashed-password' };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findUserByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createData = { email: 'new@example.com', name: 'Jane Doe', password: 'hashed-pass' };
      prisma.user.create.mockResolvedValue({ id: 'user-2', ...createData });

      const result = await service.createUser(createData);

      expect(result.id).toBe('user-2');
      expect(result.email).toBe('new@example.com');
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createData });
    });

    it('should throw when email already exists', async () => {
      prisma.user.create.mockRejectedValue(new Error('Unique constraint failed'));

      await expect(
        service.createUser({ email: 'existing@example.com', name: 'Dup', password: 'pass' }),
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('getUserById', () => {
    it('should return a user with company memberships', async () => {
      const userWithMembers = {
        ...mockUser,
        members: [{ id: 'mem-1', company: { id: 'comp-1', name: 'Acme' } }],
      };
      prisma.user.findUnique.mockResolvedValue(userWithMembers);

      const result = await service.getUserById('user-1');

      expect(result).toEqual(userWithMembers);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: { members: { include: { company: true } } },
      });
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('user-unknown');

      expect(result).toBeNull();
    });
  });
});
