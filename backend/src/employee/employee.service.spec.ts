import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let prisma: any;

  const mockEmployee = {
    id: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    phone: '+33123456789',
    position: 'Developer',
    department: 'IT',
    salary: 5000,
    companyId: 'comp-1',
  } as any;

  beforeEach(async () => {
    prisma = {
      employee: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  describe('create', () => {
    it('should create an employee', async () => {
      prisma.employee.create.mockResolvedValue(mockEmployee);
      const result = await service.create(mockEmployee);
      expect(result).toEqual(mockEmployee);
      expect(prisma.employee.create).toHaveBeenCalledWith({ data: mockEmployee });
    });

    it('should throw on duplicate email', async () => {
      prisma.employee.create.mockRejectedValue({ code: 'P2002', meta: { target: ['email'] } });
      await expect(service.create(mockEmployee)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return employees filtered by companyId', async () => {
      prisma.employee.findMany.mockResolvedValue([mockEmployee]);
      const result = await service.findAll('comp-1');
      expect(result).toEqual([mockEmployee]);
      expect(prisma.employee.findMany).toHaveBeenCalledWith({ where: { companyId: 'comp-1' } });
    });

    it('should return empty list when no employees', async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      const result = await service.findAll('comp-1');
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return employee by id', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      const result = await service.findById('emp-1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.findById('emp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.employee.update.mockResolvedValue({ ...mockEmployee, firstName: 'Jane' });
      const result = await service.update('emp-1', { firstName: 'Jane' });
      expect(result.firstName).toBe('Jane');
    });

    it('should throw NotFoundException when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.update('emp-1', { firstName: 'Jane' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an employee', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.employee.delete.mockResolvedValue(mockEmployee);
      const result = await service.delete('emp-1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.delete('emp-1')).rejects.toThrow(NotFoundException);
    });
  });
});
