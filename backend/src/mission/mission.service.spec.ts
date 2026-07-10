import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MissionService } from './mission.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MissionService', () => {
  let service: MissionService;
  let prisma: any;

  const mockMission = {
    id: 'mission-1',
    employeeId: 'emp-1',
    companyId: 'comp-1',
    title: 'Business trip',
    destination: 'Paris',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-05'),
    status: 'pending',
    budget: 2000,
  };

  const mockEmployee = { id: 'emp-1', companyId: 'comp-1' };

  beforeEach(async () => {
    prisma = {
      mission: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      expenseReport: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      employee: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MissionService>(MissionService);
  });

  describe('create', () => {
    const createDto = {
      employeeId: 'emp-1',
      companyId: 'comp-1',
      title: 'Business trip',
      destination: 'Paris',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-05'),
      budget: 2000,
    };

    it('should create a mission successfully', async () => {
      prisma.mission.create.mockResolvedValue(mockMission);

      const result = await service.create(createDto);

      expect(result).toEqual(mockMission);
      expect(prisma.mission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createDto,
          status: 'pending',
        }),
      });
    });

    it('should throw BadRequestException when start date is in the past', async () => {
      const pastDto = {
        ...createDto,
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-01-05'),
      };

      await expect(service.create(pastDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when budget is <= 0', async () => {
      const invalidBudgetDto = { ...createDto, budget: 0 };

      await expect(service.create(invalidBudgetDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when budget is negative', async () => {
      const invalidBudgetDto = { ...createDto, budget: -5 };

      await expect(service.create(invalidBudgetDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when startDate >= endDate', async () => {
      const invalidDateDto = {
        ...createDto,
        startDate: new Date('2026-09-10'),
        endDate: new Date('2026-09-05'),
      };

      await expect(service.create(invalidDateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when startDate equals endDate', async () => {
      const sameDateDto = {
        ...createDto,
        startDate: new Date('2026-09-10'),
        endDate: new Date('2026-09-10'),
      };

      await expect(service.create(sameDateDto)).rejects.toThrow(BadRequestException);
    });

    it('should skip budget validation when budget is undefined', async () => {
      const noBudgetDto = { ...createDto };
      delete noBudgetDto.budget;

      prisma.mission.create.mockResolvedValue({ ...mockMission, budget: undefined });

      const result = await service.create(noBudgetDto);

      expect(result).toBeDefined();
      expect(prisma.mission.create).toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('should approve a pending mission', async () => {
      const mission = { ...mockMission, status: 'pending' };
      prisma.mission.findUnique.mockResolvedValue(mission);
      prisma.mission.update.mockResolvedValue({ ...mission, status: 'approved' });

      const result = await service.approve('mission-1');

      expect(result.status).toBe('approved');
      expect(prisma.mission.update).toHaveBeenCalledWith({
        where: { id: 'mission-1' },
        data: { status: 'approved' },
      });
    });

    it('should throw BadRequestException when approving already approved mission', async () => {
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'approved' });

      await expect(service.approve('mission-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when mission does not exist', async () => {
      prisma.mission.findUnique.mockResolvedValue(null);

      await expect(service.approve('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when approving a rejected mission', async () => {
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'rejected' });

      await expect(service.approve('mission-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when approving a completed mission', async () => {
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'completed' });

      await expect(service.approve('mission-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a pending mission', async () => {
      prisma.mission.findUnique.mockResolvedValue(mockMission);
      prisma.mission.update.mockResolvedValue({ ...mockMission, status: 'rejected' });

      const result = await service.reject('mission-1');

      expect(result.status).toBe('rejected');
      expect(prisma.mission.update).toHaveBeenCalledWith({
        where: { id: 'mission-1' },
        data: { status: 'rejected' },
      });
    });

    it('should throw BadRequestException when rejecting already rejected mission', async () => {
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'rejected' });

      await expect(service.reject('mission-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when rejecting an approved mission', async () => {
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'approved' });

      await expect(service.reject('mission-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete an approved mission', async () => {
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'approved' });
      prisma.mission.update.mockResolvedValue({ ...mockMission, status: 'completed' });

      const result = await service.complete('mission-1');

      expect(result.status).toBe('completed');
      expect(prisma.mission.update).toHaveBeenCalledWith({
        where: { id: 'mission-1' },
        data: { status: 'completed' },
      });
    });

    it('should complete with report', async () => {
      const report = 'Mission accomplished successfully';
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'approved' });
      prisma.mission.update.mockResolvedValue({ ...mockMission, status: 'completed', report });

      const result = await service.complete('mission-1', { report });

      expect(result.status).toBe('completed');
      expect(prisma.mission.update).toHaveBeenCalledWith({
        where: { id: 'mission-1' },
        data: { status: 'completed', report },
      });
    });

    it('should throw BadRequestException when completing a pending mission', async () => {
      prisma.mission.findUnique.mockResolvedValue(mockMission);

      await expect(service.complete('mission-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when completing a rejected mission', async () => {
      prisma.mission.findUnique.mockResolvedValue({ ...mockMission, status: 'rejected' });

      await expect(service.complete('mission-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCompany', () => {
    it('should return missions for a company', async () => {
      const missions = [
        { ...mockMission, id: 'm1' },
        { ...mockMission, id: 'm2' },
      ];
      prisma.mission.findMany.mockResolvedValue(missions);

      const result = await service.findByCompany('comp-1');

      expect(result).toEqual(missions);
      expect(prisma.mission.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        orderBy: { startDate: 'desc' },
      });
    });

    it('should return empty array when no missions exist', async () => {
      prisma.mission.findMany.mockResolvedValue([]);

      const result = await service.findByCompany('comp-other');

      expect(result).toEqual([]);
    });
  });

  describe('findByEmployee', () => {
    it('should return missions for an employee', async () => {
      const missions = [{ ...mockMission, id: 'm1' }];
      prisma.mission.findMany.mockResolvedValue(missions);

      const result = await service.findByEmployee('emp-1');

      expect(result).toEqual(missions);
      expect(prisma.mission.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        orderBy: { startDate: 'desc' },
      });
    });
  });

  describe('getExpenses', () => {
    it('should return expenses for a mission', async () => {
      const expenses = [
        { id: 'exp-1', missionId: 'mission-1', amount: 100 },
        { id: 'exp-2', missionId: 'mission-1', amount: 200 },
      ];
      prisma.mission.findUnique.mockResolvedValue(mockMission);
      prisma.expenseReport.findMany.mockResolvedValue(expenses);

      const result = await service.getExpenses('mission-1');

      expect(result).toEqual(expenses);
      expect(prisma.expenseReport.findMany).toHaveBeenCalledWith({
        where: { missionId: 'mission-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw NotFoundException when mission does not exist', async () => {
      prisma.mission.findUnique.mockResolvedValue(null);

      await expect(service.getExpenses('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitExpense', () => {
    const submitDto = { expenseReportId: 'exp-1' };

    it('should link an expense report to a mission successfully', async () => {
      prisma.mission.findUnique.mockResolvedValue(mockMission);
      prisma.expenseReport.findUnique.mockResolvedValue({ id: 'exp-1', missionId: null });
      prisma.expenseReport.update.mockResolvedValue({ id: 'exp-1', missionId: 'mission-1' });

      const result = await service.submitExpense('mission-1', submitDto);

      expect(result.missionId).toBe('mission-1');
      expect(prisma.expenseReport.update).toHaveBeenCalledWith({
        where: { id: 'exp-1' },
        data: { missionId: 'mission-1' },
      });
    });

    it('should throw NotFoundException when mission does not exist', async () => {
      prisma.mission.findUnique.mockResolvedValue(null);

      await expect(service.submitExpense('nonexistent', submitDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when expense report does not exist', async () => {
      prisma.mission.findUnique.mockResolvedValue(mockMission);
      prisma.expenseReport.findUnique.mockResolvedValue(null);

      await expect(service.submitExpense('mission-1', submitDto)).rejects.toThrow(NotFoundException);
    });
  });
});
