import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentAssignmentService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.equipmentAssignment.findMany({ where: { employeeId }, include: { equipment: true } });
  }

  async findById(id: string) {
    return this.prisma.equipmentAssignment.findUnique({ where: { id } });
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
    const assignment = await this.prisma.equipmentAssignment.update({
      where: { id },
      data: { returnedAt: new Date(), conditionAtReturn },
    });
    await this.prisma.equipment.update({
      where: { id: assignment.equipmentId },
      data: { status: 'available' },
    });
    return assignment;
  }
}
