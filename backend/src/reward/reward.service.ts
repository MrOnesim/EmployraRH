import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardService {
  constructor(private prisma: PrismaService) {}

  async getCatalog(companyId: string) {
    return this.prisma.rewardCatalog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCatalogItem(data: {
    companyId: string;
    name: string;
    description?: string;
    pointsCost: number;
    stock?: number;
    category: string;
    active?: boolean;
  }) {
    if (!data.name || !data.name.trim()) throw new BadRequestException('Name is required');
    if (data.pointsCost <= 0) throw new BadRequestException('Points cost must be positive');
    return this.prisma.rewardCatalog.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description ?? '',
        pointsCost: data.pointsCost,
        stock: data.stock ?? 0,
        category: data.category,
        active: data.active ?? true,
      },
    });
  }

  async getTransactions(employeeId: string) {
    return this.prisma.rewardTransaction.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBalance(employeeId: string) {
    const transactions = await this.prisma.rewardTransaction.findMany({ where: { employeeId } });
    const balance = transactions.reduce(
      (sum, t) => (t.type === 'earned' ? sum + t.points : sum - t.points),
      0,
    );
    return { employeeId, balance };
  }

  async addTransaction(data: { employeeId: string; points: number; type: string; reason: string }) {
    if (data.points <= 0) throw new BadRequestException('Points must be positive');
    return this.prisma.rewardTransaction.create({ data });
  }

  async redeem(employeeId: string, catalogId: string) {
    const item = await this.prisma.rewardCatalog.findUnique({ where: { id: catalogId } });
    if (!item) throw new NotFoundException(`Reward with id "${catalogId}" not found`);
    if (!item.active) throw new BadRequestException('This reward is not available');
    if (item.stock <= 0) throw new BadRequestException('This reward is out of stock');
    const { balance } = await this.getBalance(employeeId);
    if (balance < item.pointsCost) throw new BadRequestException('Insufficient points balance');

    const [, transaction] = await this.prisma.$transaction([
      this.prisma.rewardCatalog.update({
        where: { id: catalogId },
        data: { stock: item.stock - 1 },
      }),
      this.prisma.rewardTransaction.create({
        data: {
          employeeId,
          points: item.pointsCost,
          type: 'redeemed',
          reason: `Redeemed: ${item.name}`,
        },
      }),
    ]);
    return transaction;
  }
}
