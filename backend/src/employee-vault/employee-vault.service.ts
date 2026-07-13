import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class EmployeeVaultService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.employeeVaultItem.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.employeeVaultItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Vault item with id "${id}" not found`);
    return item;
  }

  async create(data: {
    employeeId: string;
    type: string;
    name: string;
    fileUrl?: string;
    objectKey?: string;
    expiresAt?: string;
  }) {
    if (!data.name || !data.name.trim()) throw new BadRequestException('Name is required');
    return this.prisma.employeeVaultItem.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        name: data.name,
        fileUrl: data.fileUrl ?? null,
        objectKey: data.objectKey ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status: 'active',
      },
    });
  }

  async getUploadUrl(employeeId: string, filename: string) {
    const objectKey = `${employeeId}/${Date.now()}-${filename}`;
    const uploadUrl = await this.storage.getUploadUrl(objectKey);
    return { objectKey, uploadUrl };
  }

  async getDownloadUrl(id: string) {
    const item = await this.findById(id);
    if (!item.objectKey) throw new BadRequestException('This item has no stored object');
    const downloadUrl = await this.storage.getDownloadUrl(item.objectKey);
    return { downloadUrl };
  }

  async remove(id: string) {
    const item = await this.findById(id);
    if (item.objectKey) await this.storage.remove(item.objectKey);
    return this.prisma.employeeVaultItem.delete({ where: { id } });
  }
}
