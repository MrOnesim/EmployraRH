import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentAssignmentService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.equipmentAssignment.findMany({
      where: { employeeId },
      include: { equipment: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findByEquipment(equipmentId: string) {
    return this.prisma.equipmentAssignment.findMany({
      where: { equipmentId },
      include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.equipmentAssignment.findMany({
      where: { equipment: { companyId } },
      include: { equipment: true, employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const assignment = await this.prisma.equipmentAssignment.findUnique({ where: { id }, include: { equipment: true, employee: true } });
    if (!assignment) throw new NotFoundException(`Assignment with id "${id}" not found`);
    return assignment;
  }

  async create(data: { equipmentId: string; employeeId: string; conditionAtAssignment?: string }) {
    const assignment = await this.prisma.equipmentAssignment.create({
      data: { ...data, conditionAtAssignment: data.conditionAtAssignment || 'good' },
    });
    await this.prisma.equipment.update({
      where: { id: data.equipmentId },
      data: { status: 'assigned' },
    });
    return assignment;
  }

  async return(id: string, conditionAtReturn?: string) {
    const assignment = await this.findById(id);
    if (assignment.returnedAt) throw new Error('Equipment already returned');

    const updated = await this.prisma.equipmentAssignment.update({
      where: { id },
      data: { returnedAt: new Date(), conditionAtReturn },
    });
    await this.prisma.equipment.update({
      where: { id: assignment.equipmentId },
      data: { status: 'available' },
    });
    return updated;
  }
}
