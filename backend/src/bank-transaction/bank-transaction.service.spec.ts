import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BankTransactionService } from './bank-transaction.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BankTransactionService', () => {
  let service: BankTransactionService;
  let prisma: any;

  const mockTransaction = {
    id: 'txn-1',
    type: 'transfer',
    amount: 1000,
    currency: 'EUR',
    description: 'Test payment',
    reference: 'TX-ABC123',
    status: 'pending',
    accountId: 'acct-1',
    companyId: 'comp-1',
    date: new Date('2026-07-01'),
  };

  const mockAccount = {
    id: 'acct-1',
    bankName: 'Test Bank',
    accountName: 'John Doe',
    accountNumber: '123456789',
    companyId: 'comp-1',
  };

  beforeEach(async () => {
    prisma = {
      bankTransaction: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      bankAccount: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankTransactionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BankTransactionService>(BankTransactionService);
  });

  describe('findByCompany', () => {
    it('should return transactions for a company', async () => {
      const txns = [mockTransaction];
      prisma.bankTransaction.findMany.mockResolvedValue(txns);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.bankTransaction.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a transaction by id', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.findById('txn-1');

      expect(result.id).toBe('txn-1');
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue(null);

      await expect(service.findById('txn-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAccount', () => {
    it('should return transactions for an account', async () => {
      const txns = [{ ...mockTransaction, account: mockAccount }];
      prisma.bankTransaction.findMany.mockResolvedValue(txns);

      const result = await service.findByAccount('acct-1');

      expect(result).toHaveLength(1);
      expect(prisma.bankTransaction.findMany).toHaveBeenCalledWith({
        where: { accountId: 'acct-1' },
        include: { account: true },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('findByDateRange', () => {
    it('should return transactions within date range', async () => {
      const txns = [mockTransaction];
      prisma.bankTransaction.findMany.mockResolvedValue(txns);

      const result = await service.findByDateRange('comp-1', '2026-06-01', '2026-07-31');

      expect(result).toHaveLength(1);
      expect(prisma.bankTransaction.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'comp-1',
          date: { gte: new Date('2026-06-01'), lte: new Date('2026-07-31') },
        },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('create', () => {
    const createData = {
      type: 'payment',
      amount: 500,
      description: 'Invoice payment',
      accountId: 'acct-1',
      companyId: 'comp-1',
    };

    it('should create a transaction successfully', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
      prisma.bankTransaction.create.mockImplementation((d: any) =>
        Promise.resolve({ id: 'txn-2', ...d.data, status: 'pending' }),
      );

      const result = await service.create(createData);

      expect(result.id).toBe('txn-2');
      expect(result.status).toBe('pending');
      expect(prisma.bankTransaction.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when amount is zero or negative', async () => {
      await expect(
        service.create({ ...createData, amount: 0 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create({ ...createData, amount: -100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when account not found', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.create(createData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markCompleted', () => {
    it('should mark a pending transaction as completed', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue(mockTransaction);
      prisma.bankTransaction.update.mockResolvedValue({ ...mockTransaction, status: 'completed' });

      const result = await service.markCompleted('txn-1');

      expect(result.status).toBe('completed');
      expect(prisma.bankTransaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: 'completed' },
      });
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue(null);

      await expect(service.markCompleted('txn-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when transaction is not pending', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue({ ...mockTransaction, status: 'completed' });

      await expect(service.markCompleted('txn-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('markFailed', () => {
    it('should mark a pending transaction as failed', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue(mockTransaction);
      prisma.bankTransaction.update.mockResolvedValue({ ...mockTransaction, status: 'failed' });

      const result = await service.markFailed('txn-1');

      expect(result.status).toBe('failed');
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue(null);

      await expect(service.markFailed('txn-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when transaction is not pending', async () => {
      prisma.bankTransaction.findUnique.mockResolvedValue({ ...mockTransaction, status: 'failed' });

      await expect(service.markFailed('txn-1')).rejects.toThrow(BadRequestException);
    });
  });
});
