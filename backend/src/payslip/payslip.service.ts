import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayslipService {
  constructor(private prisma: PrismaService) {}

  async create(data: { employeeId: string; month: number; year: number; grossSalary: number; netSalary: number; pdfUrl?: string }) {
    return this.prisma.payslip.create({ data });
  }

  async findAll(companyId: string) {
    return this.prisma.payslip.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.payslip.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findById(id: string) {
    const payslip = await this.prisma.payslip.findUnique({ where: { id }, include: { employee: true } });
    if (!payslip) throw new NotFoundException('Payslip not found');
    return payslip;
  }
}
