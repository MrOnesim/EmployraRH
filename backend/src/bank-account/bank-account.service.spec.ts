import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BankAccountService', () => {
  let service: BankAccountService;
  let prisma: any;

  const mockAccount = {
    id: 'acct-1',
    bankName: 'Test Bank',
    accountName: 'John Doe',
    accountNumber: '123456789',
    iban: 'DE89370400440532013000',
    swift: 'TESTBANKXXX',
    currency: 'EUR',
    isMobileMoney: false,
    mobileProvider: null,
    isDefault: true,
    companyId: 'comp-1',
  };

  beforeEach(async () => {
    prisma = {
      bankAccount: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      bankTransaction: {
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BankAccountService>(BankAccountService);
  });

  describe('findByCompany', () => {
    it('should return accounts ordered by isDefault desc', async () => {
      const accounts = [mockAccount, { ...mockAccount, id: 'acct-2', isDefault: false }];
      prisma.bankAccount.findMany.mockResolvedValue(accounts);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(2);
      expect(prisma.bankAccount.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        orderBy: { isDefault: 'desc' },
      });
    });

    it('should return empty array when no accounts exist', async () => {
      prisma.bankAccount.findMany.mockResolvedValue([]);

      const result = await service.findByCompany('comp-unknown');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return an account by id', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

      const result = await service.findById('acct-1');

      expect(result.id).toBe('acct-1');
    });

    it('should throw NotFoundException when account not found', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.findById('acct-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createData = {
      bankName: 'New Bank',
      accountName: 'Jane Doe',
      accountNumber: '987654321',
      companyId: 'comp-1',
    };

    it('should create a bank account successfully', async () => {
      prisma.bankAccount.create.mockResolvedValue({ id: 'acct-3', ...createData, currency: 'EUR', isDefault: false });

      const result = await service.create(createData);

      expect(result.id).toBe('acct-3');
      expect(prisma.bankAccount.create).toHaveBeenCalled();
    });

    it('should unset previous default when isDefault is true', async () => {
      prisma.bankAccount.updateMany.mockResolvedValue({ count: 1 });
      prisma.bankAccount.create.mockResolvedValue({ id: 'acct-4', ...createData, isDefault: true, currency: 'EUR' });

      const result = await service.create({ ...createData, isDefault: true });

      expect(prisma.bankAccount.updateMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1', isDefault: true },
        data: { isDefault: false },
      });
      expect(result.isDefault).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a bank account successfully', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
      prisma.bankAccount.update.mockResolvedValue({ ...mockAccount, accountName: 'Updated Name' });

      const result = await service.update('acct-1', { accountName: 'Updated Name' });

      expect(result.accountName).toBe('Updated Name');
      expect(prisma.bankAccount.update).toHaveBeenCalledWith({
        where: { id: 'acct-1' },
        data: { accountName: 'Updated Name' },
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.update('acct-unknown', { accountName: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should unset other defaults when setting as default', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
      prisma.bankAccount.updateMany.mockResolvedValue({ count: 2 });
      prisma.bankAccount.update.mockResolvedValue({ ...mockAccount, isDefault: true });

      const result = await service.update('acct-1', { isDefault: true });

      expect(prisma.bankAccount.updateMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1', isDefault: true, id: { not: 'acct-1' } },
        data: { isDefault: false },
      });
      expect(result.isDefault).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete an account successfully', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
      prisma.bankTransaction.count.mockResolvedValue(0);
      prisma.bankAccount.delete.mockResolvedValue(mockAccount);

      const result = await service.delete('acct-1');

      expect(result.id).toBe('acct-1');
    });

    it('should throw NotFoundException when account not found', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.delete('acct-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when account has linked transactions', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);
      prisma.bankTransaction.count.mockResolvedValue(3);

      await expect(service.delete('acct-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('setDefault', () => {
    it('should set account as default', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue({ ...mockAccount, isDefault: false });
      prisma.bankAccount.updateMany.mockResolvedValue({ count: 1 });
      prisma.bankAccount.update.mockResolvedValue({ ...mockAccount, isDefault: true });

      const result = await service.setDefault('acct-1');

      expect(result.isDefault).toBe(true);
      expect(prisma.bankAccount.updateMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1', isDefault: true, id: { not: 'acct-1' } },
        data: { isDefault: false },
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      prisma.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.setDefault('acct-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
