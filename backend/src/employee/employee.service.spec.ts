import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let prisma: any;
  let cache: any;

  const mockEmployee = {
    id: 'emp-1',
    companyId: 'c1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    phone: '+1234567890',
    position: 'Developer',
    department: 'Engineering',
    salary: 75000,
    status: 'active',
    joinDate: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    prisma = {
      employee: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  describe('create', () => {
    it('should create an employee', async () => {
      prisma.employee.create.mockResolvedValue(mockEmployee);
      const result = await service.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        companyId: 'c1',
      });
      expect(result.email).toBe('john@test.com');
      expect(prisma.employee.create).toHaveBeenCalledWith({
        data: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', companyId: 'c1' },
      });
    });
  });

  describe('findAll', () => {
    it('should return employees (cached)', async () => {
      cache.get.mockResolvedValue([mockEmployee]);
      const result = await service.findAll('c1');
      expect(result).toHaveLength(1);
      expect(prisma.employee.findMany).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache when cache miss', async () => {
      cache.get.mockResolvedValue(null);
      prisma.employee.findMany.mockResolvedValue([mockEmployee]);
      const result = await service.findAll('c1');
      expect(result).toHaveLength(1);
      expect(cache.set).toHaveBeenCalledWith('emp:list:c1', [mockEmployee]);
    });
  });

  describe('findById', () => {
    it('should return employee from cache', async () => {
      cache.get.mockResolvedValue(mockEmployee);
      const result = await service.findById('emp-1');
      expect(result.firstName).toBe('John');
    });

    it('should fetch from DB when cache miss', async () => {
      cache.get.mockResolvedValue(null);
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      const result = await service.findById('emp-1');
      expect(result.firstName).toBe('John');
      expect(cache.set).toHaveBeenCalledWith('emp:emp-1', mockEmployee);
    });

    it('should throw NotFoundException when employee missing', async () => {
      cache.get.mockResolvedValue(null);
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update employee and bust caches', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.employee.update.mockResolvedValue({ ...mockEmployee, position: 'Senior' });
      cache.del.mockResolvedValue(true);
      const result = await service.update('emp-1', { position: 'Senior' });
      expect(result.position).toBe('Senior');
      expect(cache.del).toHaveBeenCalledWith('emp:emp-1');
      expect(cache.del).toHaveBeenCalledWith('emp:list:c1');
    });
  });

  describe('delete', () => {
    it('should delete employee and bust caches', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.employee.delete.mockResolvedValue(mockEmployee);
      cache.del.mockResolvedValue(true);
      const result = await service.delete('emp-1');
      expect(result.id).toBe('emp-1');
      expect(cache.del).toHaveBeenCalledWith('emp:emp-1');
    });
  });
});
