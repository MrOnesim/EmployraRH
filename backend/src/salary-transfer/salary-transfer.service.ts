import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalaryTransferService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.salaryTransfer.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.salaryTransfer.findUnique({ where: { id } });
  }

  async create(data: { employeeId: string; amount: number; currency?: string; type: string; description?: string }) {
    return this.prisma.salaryTransfer.create({ data: { ...data, currency: data.currency || 'EUR' } });
  }
}
