import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContractService } from './contract.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContractService', () => {
  let service: ContractService;
  let prisma: any;

  const mockContract = {
    id: 'contract-1',
    employeeId: 'emp-1',
    type: 'CDI',
    position: 'Developer',
    startDate: new Date('2026-01-01'),
    endDate: null,
    salary: 45000,
    status: 'active',
    documentUrl: null,
  };

  beforeEach(async () => {
    prisma = {
      contract: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<ContractService>(ContractService);
  });

  it('should return contracts by employee', async () => {
    prisma.contract.findMany.mockResolvedValue([mockContract]);
    const result = await service.findByEmployee('emp-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when contract not found', async () => {
    prisma.contract.findUnique.mockResolvedValue(null);
    await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
  });

  it('should create a contract', async () => {
    prisma.contract.create.mockResolvedValue(mockContract);
    const result = await service.create({
      employeeId: 'emp-1',
      type: 'CDI',
      position: 'Developer',
      startDate: '2026-01-01',
      salary: 45000,
    });
    expect(result.id).toBe('contract-1');
  });

  it('should throw BadRequestException when position is empty', async () => {
    await expect(
      service.create({
        employeeId: 'emp-1',
        type: 'CDI',
        position: '',
        startDate: '2026-01-01',
        salary: 45000,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when salary is negative', async () => {
    await expect(
      service.create({
        employeeId: 'emp-1',
        type: 'CDI',
        position: 'Dev',
        startDate: '2026-01-01',
        salary: -1,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when end date is before start date', async () => {
    await expect(
      service.create({
        employeeId: 'emp-1',
        type: 'CDD',
        position: 'Dev',
        startDate: '2026-06-01',
        endDate: '2026-01-01',
        salary: 45000,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should update a contract', async () => {
    prisma.contract.findUnique.mockResolvedValue(mockContract);
    prisma.contract.update.mockResolvedValue({ ...mockContract, status: 'terminated' });
    const result = await service.update('contract-1', { status: 'terminated' });
    expect(result.status).toBe('terminated');
  });
});
