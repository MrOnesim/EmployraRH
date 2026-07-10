import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollConfigService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    const config = await this.prisma.payrollConfig.findUnique({ where: { companyId } });
    if (!config) throw new NotFoundException('Payroll config not found');
    return config;
  }

  async upsert(companyId: string, data: Partial<{ currency: string; taxRate: number; socialChargesRate: number; paymentDay: number; overtimeRate: number }>) {
    if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 1)) {
      throw new BadRequestException('taxRate must be between 0 and 1');
    }
    if (data.socialChargesRate !== undefined && (data.socialChargesRate < 0 || data.socialChargesRate > 1)) {
      throw new BadRequestException('socialChargesRate must be between 0 and 1');
    }
    if (data.paymentDay !== undefined && (data.paymentDay < 1 || data.paymentDay > 31)) {
      throw new BadRequestException('paymentDay must be between 1 and 31');
    }
    if (data.overtimeRate !== undefined && data.overtimeRate < 1) {
      throw new BadRequestException('overtimeRate must be >= 1');
    }
    return this.prisma.payrollConfig.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    });
  }
}
