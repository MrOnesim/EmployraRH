import { Injectable } from '@nestjs/common';
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
    return this.prisma.equipment.findUnique({ where: { id }, include: { assignments: true } });
  }

  async create(data: { name: string; type: string; serialNumber: string; status?: string; purchaseDate?: Date; purchasePrice?: number; condition?: string; notes?: string; companyId: string }) {
    return this.prisma.equipment.create({
      data: { ...data, status: data.status || 'available', condition: data.condition || 'good' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.equipment.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.equipment.delete({ where: { id } });
  }
}
