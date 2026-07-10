import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: any;

  const mockCompany = {
    id: 'comp-1',
    name: 'Test Corp',
    slug: 'test-corp',
    currency: 'EUR',
    country: 'FR',
  };

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@test.com',
  };

  beforeEach(async () => {
    prisma = {
      company: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      member: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  describe('create', () => {
    it('should create a company', async () => {
      prisma.company.create.mockResolvedValue(mockCompany);

      const result = await service.create({
        name: 'Test Corp',
        slug: 'test-corp',
        currency: 'EUR',
        country: 'FR',
      });

      expect(result).toEqual(mockCompany);
      expect(prisma.company.create).toHaveBeenCalledWith({
        data: { name: 'Test Corp', slug: 'test-corp', currency: 'EUR', country: 'FR' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all companies with counts', async () => {
      const companies = [
        { ...mockCompany, _count: { members: 3, employees: 10 } },
        { ...mockCompany, id: 'comp-2', name: 'Other Corp', _count: { members: 1, employees: 5 } },
      ];
      prisma.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]._count.members).toBe(3);
      expect(prisma.company.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { members: true, employees: true } } },
      });
    });
  });

  describe('findById', () => {
    it('should return a company with members', async () => {
      const companyWithMembers = {
        ...mockCompany,
        members: [{ id: 'm-1', userId: 'user-1', role: 'ADMIN', user: mockUser }],
      };
      prisma.company.findUnique.mockResolvedValue(companyWithMembers);

      const result = await service.findById('comp-1');

      expect(result.id).toBe('comp-1');
      expect(result.members).toHaveLength(1);
      expect(prisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'comp-1' },
        include: { members: { include: { user: true } } },
      });
    });

    it('should return null when company not found', async () => {
      prisma.company.findUnique.mockResolvedValue(null);

      const result = await service.findById('comp-unknown');

      expect(result).toBeNull();
    });
  });

  describe('addMember', () => {
    it('should add a member to a company', async () => {
      const mockMember = { id: 'm-1', companyId: 'comp-1', userId: 'user-1', role: 'EMPLOYEE' };
      prisma.member.create.mockResolvedValue(mockMember);

      const result = await service.addMember('comp-1', 'user-1');

      expect(result).toEqual(mockMember);
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: { companyId: 'comp-1', userId: 'user-1', role: 'EMPLOYEE' },
      });
    });

    it('should add a member with a specific role', async () => {
      const mockMember = { id: 'm-2', companyId: 'comp-1', userId: 'user-2', role: 'ADMIN' };
      prisma.member.create.mockResolvedValue(mockMember);

      const result = await service.addMember('comp-1', 'user-2', 'ADMIN');

      expect(result.role).toBe('ADMIN');
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: { companyId: 'comp-1', userId: 'user-2', role: 'ADMIN' },
      });
    });

    it('should throw on duplicate member (unique constraint)', async () => {
      prisma.member.create.mockRejectedValue(
        Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }),
      );

      await expect(service.addMember('comp-1', 'user-1')).rejects.toThrow();
    });
  });
});
