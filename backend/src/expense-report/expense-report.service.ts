import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseReportService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.expenseReport.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.expenseReport.findUnique({ where: { id } });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.expenseReport.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { employeeId: string; title: string; category: string; amount: number; receiptUrl?: string; description?: string; companyId: string }) {
    return this.prisma.expenseReport.create({ data });
  }

  async update(id: string, data: { status?: string; approvedBy?: string; approvedAt?: Date; rejectionReason?: string }) {
    return this.prisma.expenseReport.update({ where: { id }, data });
  }
}
