import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankTransactionService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.bankTransaction.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.bankTransaction.findUnique({ where: { id } });
  }

  async create(data: { type: string; amount: number; currency?: string; description?: string; reference: string; accountId: string; companyId: string }) {
    return this.prisma.bankTransaction.create({ data: { ...data, currency: data.currency || 'EUR' } });
  }
}
