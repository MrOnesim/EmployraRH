import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankAccountService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async findById(id: string) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }

  async create(data: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    iban?: string;
    swift?: string;
    currency?: string;
    isMobileMoney?: boolean;
    mobileProvider?: string;
    isDefault?: boolean;
    companyId: string;
  }) {
    if (data.isDefault) {
      await this.prisma.bankAccount.updateMany({
        where: { companyId: data.companyId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.bankAccount.create({
      data: { ...data, currency: data.currency || 'EUR', isDefault: data.isDefault || false },
    });
  }

  async update(id: string, data: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    iban?: string;
    swift?: string;
    currency?: string;
    isMobileMoney?: boolean;
    mobileProvider?: string;
    isDefault?: boolean;
  }) {
    const account = await this.findById(id);
    if (data.isDefault) {
      await this.prisma.bankAccount.updateMany({
        where: { companyId: account.companyId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return this.prisma.bankAccount.update({ where: { id }, data });
  }

  async delete(id: string) {
    const account = await this.findById(id);
    const txnCount = await this.prisma.bankTransaction.count({ where: { accountId: id } });
    if (txnCount > 0) throw new BadRequestException('Cannot delete account with linked transactions');
    return this.prisma.bankAccount.delete({ where: { id } });
  }

  async setDefault(id: string) {
    const account = await this.findById(id);
    await this.prisma.bankAccount.updateMany({
      where: { companyId: account.companyId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
    return this.prisma.bankAccount.update({ where: { id }, data: { isDefault: true } });
  }
}
