import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MissionService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.mission.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.mission.findUnique({ where: { id } });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.mission.findMany({ where: { employeeId }, orderBy: { startDate: 'desc' } });
  }

  async create(data: { employeeId: string; title: string; destination: string; startDate: Date; endDate: Date; description?: string; budget?: number; transportation?: string; accommodation?: string; companyId: string }) {
    return this.prisma.mission.create({ data });
  }

  async update(id: string, data: { status?: string; report?: string; actualExpenses?: number }) {
    return this.prisma.mission.update({ where: { id }, data });
  }
}
