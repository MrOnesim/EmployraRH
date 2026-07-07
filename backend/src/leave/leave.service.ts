import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async create(data: { employeeId: string; type: string; startDate: Date; endDate: Date; reason?: string }) {
    return this.prisma.leave.create({ data: { ...data, status: 'pending' } });
  }

  async findAll(companyId: string) {
    return this.prisma.leave.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.leave.findMany({ where: { employeeId } });
  }

  async update(id: string, data: { status?: string; comment?: string }) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    return this.prisma.leave.update({ where: { id }, data });
  }
}
