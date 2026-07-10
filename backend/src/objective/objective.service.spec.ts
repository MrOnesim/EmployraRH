import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectiveService } from './objective.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ObjectiveService', () => {
  let service: ObjectiveService;
  let prisma: any;

  const futureDeadline = new Date(Date.now() + 86400000 * 30);

  const mockObjective = {
    id: 'obj-1',
    employeeId: 'emp-1',
    title: 'Complete project',
    description: 'Finish the Q3 project',
    category: 'performance',
    status: 'pending',
    deadline: futureDeadline,
    createdAt: new Date('2026-07-01'),
  };

  const mockEmployee = { id: 'emp-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

  beforeEach(async () => {
    prisma = {
      objective: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectiveService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ObjectiveService>(ObjectiveService);
  });

  describe('findByEmployee', () => {
    it('should return objectives for an employee', async () => {
      const objectives = [mockObjective];
      prisma.objective.findMany.mockResolvedValue(objectives);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.objective.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByCompany', () => {
    it('should return objectives for a company with employee info', async () => {
      const objectives = [{ ...mockObjective, employee: mockEmployee }];
      prisma.objective.findMany.mockResolvedValue(objectives);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.objective.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' } },
        include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByCategory', () => {
    it('should return objectives filtered by category', async () => {
      const objectives = [{ ...mockObjective, employee: mockEmployee }];
      prisma.objective.findMany.mockResolvedValue(objectives);

      const result = await service.findByCategory('comp-1', 'performance');

      expect(result).toHaveLength(1);
      expect(prisma.objective.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' }, category: 'performance' },
        include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByStatus', () => {
    it('should return objectives filtered by status', async () => {
      const objectives = [{ ...mockObjective, employee: mockEmployee }];
      prisma.objective.findMany.mockResolvedValue(objectives);

      const result = await service.findByStatus('comp-1', 'pending');

      expect(result).toHaveLength(1);
      expect(prisma.objective.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' }, status: 'pending' },
        include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return an objective with employee details', async () => {
      const objectiveWithEmp = { ...mockObjective, employee: { ...mockEmployee, email: 'john@example.com' } };
      prisma.objective.findUnique.mockResolvedValue(objectiveWithEmp);

      const result = await service.findById('obj-1');

      expect(result.id).toBe('obj-1');
      expect(result.employee.email).toBe('john@example.com');
    });

    it('should throw NotFoundException when objective not found', async () => {
      prisma.objective.findUnique.mockResolvedValue(null);

      await expect(service.findById('obj-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an objective successfully', async () => {
      const createData = {
        employeeId: 'emp-1',
        title: 'New objective',
        category: 'performance',
      };
      prisma.objective.create.mockResolvedValue({ id: 'obj-2', ...createData, status: 'pending' });

      const result = await service.create(createData);

      expect(result.id).toBe('obj-2');
      expect(result.status).toBe('pending');
    });

    it('should throw BadRequestException when title is empty', async () => {
      await expect(
        service.create({ employeeId: 'emp-1', title: '', category: 'performance' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when category is empty', async () => {
      await expect(
        service.create({ employeeId: 'emp-1', title: 'Test', category: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when deadline is in the past', async () => {
      await expect(
        service.create({ employeeId: 'emp-1', title: 'Test', category: 'performance', deadline: new Date('2020-01-01') }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should transition from pending to in_progress', async () => {
      prisma.objective.findUnique.mockResolvedValue(mockObjective);
      prisma.objective.update.mockResolvedValue({ ...mockObjective, status: 'in_progress' });

      const result = await service.updateStatus('obj-1', 'in_progress');

      expect(result.status).toBe('in_progress');
    });

    it('should transition from pending to cancelled', async () => {
      prisma.objective.findUnique.mockResolvedValue(mockObjective);
      prisma.objective.update.mockResolvedValue({ ...mockObjective, status: 'cancelled' });

      const result = await service.updateStatus('obj-1', 'cancelled');

      expect(result.status).toBe('cancelled');
    });

    it('should transition from in_progress to completed', async () => {
      prisma.objective.findUnique.mockResolvedValue({ ...mockObjective, status: 'in_progress' });
      prisma.objective.update.mockResolvedValue({ ...mockObjective, status: 'completed' });

      const result = await service.updateStatus('obj-1', 'completed');

      expect(result.status).toBe('completed');
    });

    it('should throw BadRequestException for invalid transition', async () => {
      prisma.objective.findUnique.mockResolvedValue(mockObjective);

      await expect(service.updateStatus('obj-1', 'completed')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when objective not found', async () => {
      prisma.objective.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('obj-unknown', 'in_progress')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an objective successfully', async () => {
      prisma.objective.findUnique.mockResolvedValue(mockObjective);
      prisma.objective.update.mockResolvedValue({ ...mockObjective, title: 'Updated title' });

      const result = await service.update('obj-1', { title: 'Updated title' });

      expect(result.title).toBe('Updated title');
    });

    it('should throw NotFoundException when objective not found', async () => {
      prisma.objective.findUnique.mockResolvedValue(null);

      await expect(service.update('obj-unknown', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when objective is completed', async () => {
      prisma.objective.findUnique.mockResolvedValue({ ...mockObjective, status: 'completed' });

      await expect(service.update('obj-1', { title: 'Test' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when objective is cancelled', async () => {
      prisma.objective.findUnique.mockResolvedValue({ ...mockObjective, status: 'cancelled' });

      await expect(service.update('obj-1', { title: 'Test' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when deadline is in the past', async () => {
      prisma.objective.findUnique.mockResolvedValue(mockObjective);

      await expect(
        service.update('obj-1', { deadline: new Date('2020-01-01') }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
