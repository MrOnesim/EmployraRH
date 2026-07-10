import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let prisma: any;

  const mockEquipment = {
    id: 'equip-1',
    name: 'MacBook Pro',
    type: 'laptop',
    serialNumber: 'SN-001',
    status: 'available',
    condition: 'good',
    companyId: 'comp-1',
    purchaseDate: null,
    purchasePrice: null,
    notes: null,
    assignments: [],
  };

  beforeEach(async () => {
    prisma = {
      equipment: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      equipmentAssignment: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      employee: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EquipmentService>(EquipmentService);
  });

  describe('findAll', () => {
    it('should return all equipment', async () => {
      prisma.equipment.findMany.mockResolvedValue([mockEquipment]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(prisma.equipment.findMany).toHaveBeenCalled();
    });

    it('should filter by companyId', async () => {
      prisma.equipment.findMany.mockResolvedValue([mockEquipment]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return equipment by id', async () => {
      prisma.equipment.findUnique.mockResolvedValue(mockEquipment);
      const result = await service.findById('equip-1');
      expect(result.id).toBe('equip-1');
    });

    it('should throw when not found', async () => {
      prisma.equipment.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCompany', () => {
    it('should return equipment for a company', async () => {
      prisma.equipment.findMany.mockResolvedValue([mockEquipment]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findAvailable', () => {
    it('should return available equipment', async () => {
      prisma.equipment.findMany.mockResolvedValue([mockEquipment]);
      const result = await service.findAvailable('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByType', () => {
    it('should return equipment by type', async () => {
      prisma.equipment.findMany.mockResolvedValue([mockEquipment]);
      const result = await service.findByType('comp-1', 'laptop');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create equipment successfully', async () => {
      prisma.equipment.findFirst.mockResolvedValue(null);
      prisma.equipment.create.mockResolvedValue(mockEquipment);
      const result = await service.create({
        name: 'MacBook Pro', type: 'laptop', serialNumber: 'SN-001', companyId: 'comp-1',
      });
      expect(result).toEqual(mockEquipment);
    });

    it('should throw when serial number already exists', async () => {
      prisma.equipment.findFirst.mockResolvedValue(mockEquipment);
      await expect(service.create({
        name: 'MacBook Pro', type: 'laptop', serialNumber: 'SN-001', companyId: 'comp-1',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update equipment', async () => {
      prisma.equipment.findUnique.mockResolvedValue(mockEquipment);
      prisma.equipment.update.mockResolvedValue({ ...mockEquipment, name: 'Updated' });
      const result = await service.update('equip-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw when not found', async () => {
      prisma.equipment.findUnique.mockResolvedValue(null);
      await expect(service.update('unknown', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete equipment', async () => {
      prisma.equipment.findUnique.mockResolvedValue(mockEquipment);
      prisma.equipment.delete.mockResolvedValue(mockEquipment);
      const result = await service.delete('equip-1');
      expect(result).toEqual(mockEquipment);
    });

    it('should throw when not found', async () => {
      prisma.equipment.findUnique.mockResolvedValue(null);
      await expect(service.delete('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should transition from available to assigned', async () => {
      prisma.equipment.findUnique.mockResolvedValue(mockEquipment);
      prisma.equipment.update.mockResolvedValue({ ...mockEquipment, status: 'assigned' });
      const result = await service.updateStatus('equip-1', 'assigned');
      expect(result.status).toBe('assigned');
    });

    it('should throw on invalid transition', async () => {
      prisma.equipment.findUnique.mockResolvedValue({ ...mockEquipment, status: 'retired' });
      await expect(service.updateStatus('equip-1', 'available')).rejects.toThrow(BadRequestException);
    });
  });

  describe('assign', () => {
    it('should assign equipment to an employee', async () => {
      prisma.equipment.findUnique.mockResolvedValue(mockEquipment);
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.equipmentAssignment.create.mockResolvedValue({ id: 'assign-1', equipmentId: 'equip-1', employeeId: 'emp-1' });
      prisma.equipment.update.mockResolvedValue({ ...mockEquipment, status: 'assigned' });
      const result = await service.assign('equip-1', 'emp-1');
      expect(result.id).toBe('assign-1');
    });

    it('should throw when equipment not available', async () => {
      prisma.equipment.findUnique.mockResolvedValue({ ...mockEquipment, status: 'assigned' });
      await expect(service.assign('equip-1', 'emp-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when employee not found', async () => {
      prisma.equipment.findUnique.mockResolvedValue(mockEquipment);
      prisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.assign('equip-1', 'emp-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('return', () => {
    it('should return equipment successfully', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue({ id: 'assign-1', equipmentId: 'equip-1', returnedAt: null });
      prisma.equipmentAssignment.update.mockResolvedValue({ id: 'assign-1', returnedAt: new Date(), conditionAtReturn: 'good' });
      prisma.equipment.update.mockResolvedValue({ ...mockEquipment, status: 'available' });
      const result = await service.return('assign-1');
      expect(result.returnedAt).toBeDefined();
    });

    it('should throw when assignment not found', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue(null);
      await expect(service.return('unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw when already returned', async () => {
      prisma.equipmentAssignment.findUnique.mockResolvedValue({ id: 'assign-1', returnedAt: new Date() });
      await expect(service.return('assign-1')).rejects.toThrow(BadRequestException);
    });
  });
});
