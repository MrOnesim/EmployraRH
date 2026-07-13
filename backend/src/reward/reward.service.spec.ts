import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RewardService } from './reward.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RewardService', () => {
  let service: RewardService;
  let prisma: any;

  const mockCatalogItem = {
    id: 'reward-1',
    companyId: 'comp-1',
    name: 'Gift card',
    description: '',
    pointsCost: 100,
    stock: 5,
    category: 'gift',
    active: true,
  };

  beforeEach(async () => {
    prisma = {
      rewardCatalog: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      rewardTransaction: { findMany: vi.fn(), create: vi.fn() },
      $transaction: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<RewardService>(RewardService);
  });

  it('should return the catalog for a company', async () => {
    prisma.rewardCatalog.findMany.mockResolvedValue([mockCatalogItem]);
    const result = await service.getCatalog('comp-1');
    expect(result).toHaveLength(1);
  });

  it('should create a catalog item', async () => {
    prisma.rewardCatalog.create.mockResolvedValue(mockCatalogItem);
    const result = await service.createCatalogItem({
      companyId: 'comp-1',
      name: 'Gift card',
      pointsCost: 100,
      category: 'gift',
    });
    expect(result.id).toBe('reward-1');
  });

  it('should throw BadRequestException when points cost is not positive', async () => {
    await expect(
      service.createCatalogItem({
        companyId: 'comp-1',
        name: 'X',
        pointsCost: 0,
        category: 'gift',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should compute balance from transactions', async () => {
    prisma.rewardTransaction.findMany.mockResolvedValue([
      { type: 'earned', points: 200 },
      { type: 'redeemed', points: 50 },
    ]);
    const result = await service.getBalance('emp-1');
    expect(result.balance).toBe(150);
  });

  it('should add a transaction', async () => {
    prisma.rewardTransaction.create.mockResolvedValue({ id: 'tx-1' });
    const result = await service.addTransaction({
      employeeId: 'emp-1',
      points: 50,
      type: 'earned',
      reason: 'Bonus',
    });
    expect(result.id).toBe('tx-1');
  });

  it('should throw BadRequestException when points are not positive', async () => {
    await expect(
      service.addTransaction({ employeeId: 'emp-1', points: 0, type: 'earned', reason: 'Bonus' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when redeeming unknown reward', async () => {
    prisma.rewardCatalog.findUnique.mockResolvedValue(null);
    await expect(service.redeem('emp-1', 'unknown')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when out of stock', async () => {
    prisma.rewardCatalog.findUnique.mockResolvedValue({ ...mockCatalogItem, stock: 0 });
    await expect(service.redeem('emp-1', 'reward-1')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when balance is insufficient', async () => {
    prisma.rewardCatalog.findUnique.mockResolvedValue(mockCatalogItem);
    prisma.rewardTransaction.findMany.mockResolvedValue([{ type: 'earned', points: 50 }]);
    await expect(service.redeem('emp-1', 'reward-1')).rejects.toThrow(BadRequestException);
  });

  it('should redeem a reward when balance and stock are sufficient', async () => {
    prisma.rewardCatalog.findUnique.mockResolvedValue(mockCatalogItem);
    prisma.rewardTransaction.findMany.mockResolvedValue([{ type: 'earned', points: 200 }]);
    prisma.$transaction.mockResolvedValue([{}, { id: 'tx-2', type: 'redeemed', points: 100 }]);
    const result = await service.redeem('emp-1', 'reward-1');
    expect(result.type).toBe('redeemed');
  });
});
