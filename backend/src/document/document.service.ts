import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { employeeId: string; name: string; type: string; url: string }) {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('Name is required');
    }
    if (!data.type || data.type.trim().length === 0) {
      throw new BadRequestException('Type is required');
    }
    if (!data.url || data.url.trim().length === 0) {
      throw new BadRequestException('URL is required');
    }
    return this.prisma.document.create({ data });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.document.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.document.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByType(companyId: string, type: string) {
    return this.prisma.document.findMany({
      where: { employee: { companyId }, type },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return this.prisma.document.delete({ where: { id } });
  }
}
