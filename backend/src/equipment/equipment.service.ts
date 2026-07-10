import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.equipment.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      include: { assignments: true },
    });
  }

  async findById(id: string) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id }, include: { assignments: true } });
    if (!equipment) throw new NotFoundException(`Equipment with id "${id}" not found`);
    return equipment;
  }

  async findByCompany(companyId: string) {
    return this.prisma.equipment.findMany({
      where: { companyId },
      include: {
        assignments: {
          where: { returnedAt: null },
          include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAvailable(companyId: string) {
    return this.prisma.equipment.findMany({
      where: { companyId, status: 'available' },
      orderBy: { name: 'asc' },
    });
  }

  async findByType(companyId: string, type: string) {
    return this.prisma.equipment.findMany({
      where: { companyId, type },
      include: { assignments: { where: { returnedAt: null } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: {
    name: string; type: string; serialNumber: string; status?: string;
    purchaseDate?: Date; purchasePrice?: number; condition?: string; notes?: string; companyId: string;
  }) {
    const existing = await this.prisma.equipment.findFirst({
      where: { companyId: data.companyId, serialNumber: data.serialNumber },
    });
    if (existing) {
      throw new BadRequestException(`Equipment with serial number "${data.serialNumber}" already exists in this company`);
    }
    return this.prisma.equipment.create({
      data: { ...data, status: data.status || 'available', condition: data.condition || 'good' },
    });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.equipment.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.equipment.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    const equipment = await this.findById(id);
    const validTransitions: Record<string, string[]> = {
      available: ['assigned', 'maintenance', 'retired'],
      assigned: ['maintenance', 'retired'],
      maintenance: ['available', 'retired'],
      retired: [],
    };
    const allowed = validTransitions[equipment.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from "${equipment.status}" to "${status}"`);
    }
    return this.prisma.equipment.update({ where: { id }, data: { status } });
  }

  async assign(equipmentId: string, employeeId: string, conditionAtAssignment?: string) {
    const equipment = await this.findById(equipmentId);
    if (equipment.status !== 'available') {
      throw new BadRequestException(`Equipment is not available (current status: ${equipment.status})`);
    }
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException(`Employee with id "${employeeId}" not found`);

    const assignment = await this.prisma.equipmentAssignment.create({
      data: { equipmentId, employeeId, conditionAtAssignment: conditionAtAssignment || 'good' },
    });
    await this.prisma.equipment.update({ where: { id: equipmentId }, data: { status: 'assigned' } });
    return assignment;
  }

  async return(assignmentId: string, conditionAtReturn?: string) {
    const assignment = await this.prisma.equipmentAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException(`Assignment with id "${assignmentId}" not found`);
    if (assignment.returnedAt) throw new BadRequestException('Equipment already returned');

    const updated = await this.prisma.equipmentAssignment.update({
      where: { id: assignmentId },
      data: { returnedAt: new Date(), conditionAtReturn },
    });
    await this.prisma.equipment.update({ where: { id: assignment.equipmentId }, data: { status: 'available' } });
    return updated;
  }
}
