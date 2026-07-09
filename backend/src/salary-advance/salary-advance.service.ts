import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalaryAdvanceService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.salaryAdvance.findMany({ where: { employeeId }, orderBy: { requestedAt: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.salaryAdvance.findUnique({ where: { id } });
  }

  async create(data: { employeeId: string; amount: number; currency?: string; reason?: string }) {
    return this.prisma.salaryAdvance.create({ data: { ...data, currency: data.currency || 'EUR' } });
  }

  async update(id: string, data: { status?: string; approvedBy?: string; approvedAt?: Date; paidAt?: Date; repaymentDate?: Date; repaymentAmount?: number }) {
    return this.prisma.salaryAdvance.update({ where: { id }, data });
  }
}
