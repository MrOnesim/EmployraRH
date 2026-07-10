import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EquipmentAssignmentService } from './equipment-assignment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EquipmentAssignmentService', () => {
  let service: EquipmentAssignmentService;
  let prisma: any;

  const mockAssignment = {
    id: 'assign-1',
    equipmentId: 'equip-1',
    employeeId: 'emp-1',
    conditionAtAssignment: 'good',
    conditionAtReturn: null,
    assignedAt: new Date(),
    returnedAt: null,
    equipment: { id: 'equip-1', name: 'MacBook Pro', serialNumber: 'SN-001' },
    employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
  };

  beforeEach(async () => {
    prisma = {
      equipmentAssignment: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      equipment: { update: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentAssignmentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EquipmentAssignmentService>(EquipmentAssignmentService);
  });

  describe('findByEmployee', () => {
    it('should return assignments for an employee', async () => {
      prisma.equipmentAssignment.findMany.mockResolvedValue([mockAssignment]);
      const result = await service.findByEmployee('emp-1');
      expect(result).toHaveLength(1);
      expect(prisma.equipmentAssignment.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        include: { equipment: true },
        orderBy: { assignedAt: 'desc' },
      });
    });
  });

  describe('findByEquipment', () => {
    it('should return assignments for equipment', async () => {
      prisma.equipmentAssignment.findMany.mockResolvedValue([mockAssignment]);
      const result = await service.findByEquipment('equip-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByCompany', () => {
    it('should return assignments for a company', async () => {
      prisma.equipmentAssignment.findMany.mockResolvedValue([mockAssignment]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return an assignment by id', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue(mockAssignment);
      const result = await service.findById('assign-1');
      expect(result.id).toBe('assign-1');
    });

    it('should throw when not found', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an assignment and update equipment status', async () => {
      prisma.equipmentAssignment.create.mockResolvedValue(mockAssignment);
      prisma.equipment.update.mockResolvedValue({});
      const result = await service.create({ equipmentId: 'equip-1', employeeId: 'emp-1' });
      expect(result).toEqual(mockAssignment);
      expect(prisma.equipment.update).toHaveBeenCalledWith({
        where: { id: 'equip-1' },
        data: { status: 'assigned' },
      });
    });
  });

  describe('return', () => {
    it('should return equipment successfully', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue(mockAssignment);
      prisma.equipmentAssignment.update.mockResolvedValue({ ...mockAssignment, returnedAt: new Date(), conditionAtReturn: 'good' });
      prisma.equipment.update.mockResolvedValue({});
      const result = await service.return('assign-1', 'good');
      expect(result.returnedAt).toBeDefined();
    });

    it('should throw when assignment not found', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue(null);
      await expect(service.return('unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw when already returned', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue({ ...mockAssignment, returnedAt: new Date() });
      await expect(service.return('assign-1')).rejects.toThrow('Equipment already returned');
    });
  });
});
