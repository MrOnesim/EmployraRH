import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankTransactionService {
  constructor(private prisma: PrismaService) {}

  private generateReference(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TX-${ts}-${rand}`;
  }

  async findByCompany(companyId: string) {
    return this.prisma.bankTransaction.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    const txn = await this.prisma.bankTransaction.findUnique({ where: { id } });
    if (!txn) throw new NotFoundException('Bank transaction not found');
    return txn;
  }

  async findByAccount(accountId: string) {
    return this.prisma.bankTransaction.findMany({
      where: { accountId },
      include: { account: true },
      orderBy: { date: 'desc' },
    });
  }

  async findByDateRange(companyId: string, startDate: string, endDate: string) {
    return this.prisma.bankTransaction.findMany({
      where: {
        companyId,
        date: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: {
    type: string;
    amount: number;
    currency?: string;
    description?: string;
    accountId: string;
    companyId: string;
  }) {
    if (data.amount <= 0) throw new BadRequestException('Amount must be positive');
    const account = await this.prisma.bankAccount.findUnique({ where: { id: data.accountId } });
    if (!account) throw new NotFoundException('Bank account not found');
    return this.prisma.bankTransaction.create({
      data: {
        ...data,
        currency: data.currency || 'EUR',
        reference: this.generateReference(),
        status: 'pending',
      },
    });
  }

  async markCompleted(id: string) {
    const txn = await this.findById(id);
    if (txn.status !== 'pending') throw new BadRequestException('Only pending transactions can be completed');
    return this.prisma.bankTransaction.update({ where: { id }, data: { status: 'completed' } });
  }

  async markFailed(id: string) {
    const txn = await this.findById(id);
    if (txn.status !== 'pending') throw new BadRequestException('Only pending transactions can be failed');
    return this.prisma.bankTransaction.update({ where: { id }, data: { status: 'failed' } });
  }
}
