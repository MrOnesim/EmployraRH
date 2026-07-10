import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalaryTransferService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.salaryTransfer.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.salaryTransfer.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const transfer = await this.prisma.salaryTransfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('Salary transfer not found');
    return transfer;
  }

  async findByType(companyId: string, type: string) {
    return this.prisma.salaryTransfer.findMany({
      where: { employee: { companyId }, type },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    employeeId: string;
    amount: number;
    currency?: string;
    type: string;
    description?: string;
  }) {
    if (data.amount <= 0) throw new BadRequestException('Amount must be positive');
    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');
    return this.prisma.salaryTransfer.create({
      data: {
        ...data,
        currency: data.currency || 'EUR',
        status: 'pending',
      },
    });
  }

  async complete(id: string) {
    const transfer = await this.findById(id);
    if (transfer.status !== 'pending') throw new BadRequestException('Only pending transfers can be completed');
    return this.prisma.salaryTransfer.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async fail(id: string) {
    const transfer = await this.findById(id);
    if (transfer.status !== 'pending') throw new BadRequestException('Only pending transfers can be failed');
    return this.prisma.salaryTransfer.update({ where: { id }, data: { status: 'failed' } });
  }
}
