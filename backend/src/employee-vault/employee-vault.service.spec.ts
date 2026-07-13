import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmployeeVaultService } from './employee-vault.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('EmployeeVaultService', () => {
  let service: EmployeeVaultService;
  let prisma: any;
  let storage: any;

  const mockItem = {
    id: 'vault-1',
    employeeId: 'emp-1',
    type: 'contract',
    name: 'CDI',
    fileUrl: null,
    objectKey: 'emp-1/123-cdi.pdf',
    status: 'active',
    uploadedAt: new Date('2026-07-01'),
    expiresAt: null,
  };

  beforeEach(async () => {
    prisma = {
      employeeVaultItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };
    storage = {
      getUploadUrl: vi.fn(),
      getDownloadUrl: vi.fn(),
      remove: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeVaultService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();
    service = module.get<EmployeeVaultService>(EmployeeVaultService);
  });

  it('should return vault items by employee', async () => {
    prisma.employeeVaultItem.findMany.mockResolvedValue([mockItem]);
    const result = await service.findByEmployee('emp-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when item not found', async () => {
    prisma.employeeVaultItem.findUnique.mockResolvedValue(null);
    await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
  });

  it('should create a vault item', async () => {
    prisma.employeeVaultItem.create.mockResolvedValue(mockItem);
    const result = await service.create({ employeeId: 'emp-1', type: 'contract', name: 'CDI' });
    expect(result.id).toBe('vault-1');
  });

  it('should throw BadRequestException when name is empty', async () => {
    await expect(
      service.create({ employeeId: 'emp-1', type: 'contract', name: '' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should generate an upload url', async () => {
    storage.getUploadUrl.mockResolvedValue('https://minio/upload');
    const result = await service.getUploadUrl('emp-1', 'cdi.pdf');
    expect(result.uploadUrl).toBe('https://minio/upload');
    expect(result.objectKey).toContain('emp-1/');
  });

  it('should throw BadRequestException for download url when no object key', async () => {
    prisma.employeeVaultItem.findUnique.mockResolvedValue({ ...mockItem, objectKey: null });
    await expect(service.getDownloadUrl('vault-1')).rejects.toThrow(BadRequestException);
  });

  it('should return a download url when object key exists', async () => {
    prisma.employeeVaultItem.findUnique.mockResolvedValue(mockItem);
    storage.getDownloadUrl.mockResolvedValue('https://minio/download');
    const result = await service.getDownloadUrl('vault-1');
    expect(result.downloadUrl).toBe('https://minio/download');
  });

  it('should remove a vault item and its stored object', async () => {
    prisma.employeeVaultItem.findUnique.mockResolvedValue(mockItem);
    prisma.employeeVaultItem.delete.mockResolvedValue(mockItem);
    await service.remove('vault-1');
    expect(storage.remove).toHaveBeenCalledWith('emp-1/123-cdi.pdf');
    expect(prisma.employeeVaultItem.delete).toHaveBeenCalled();
  });
});
