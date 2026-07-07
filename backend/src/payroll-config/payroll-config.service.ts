import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfig(companyId: string) {
    const config = await this.prisma.payrollConfig.findUnique({ where: { companyId } });
    if (!config) throw new NotFoundException('Payroll config not found');
    return config;
  }

  async upsertConfig(companyId: string, data: Partial<{ currency: string; taxRate: number; socialChargesRate: number; paymentDay: number; overtimeRate: number }>) {
    return this.prisma.payrollConfig.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    });
  }
}
