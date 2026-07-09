import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankAccountService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.bankAccount.findMany(companyId ? { where: { companyId } } : undefined);
  }

  async findById(id: string) {
    return this.prisma.bankAccount.findUnique({ where: { id } });
  }

  async create(data: { bankName: string; accountName: string; accountNumber: string; iban?: string; swift?: string; currency?: string; isMobileMoney?: boolean; mobileProvider?: string; companyId: string }) {
    return this.prisma.bankAccount.create({ data: { ...data, currency: data.currency || 'EUR' } });
  }

  async update(id: string, data: any) {
    return this.prisma.bankAccount.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.bankAccount.delete({ where: { id } });
  }
}
