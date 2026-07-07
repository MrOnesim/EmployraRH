import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { employeeId: string; name: string; type: string; url: string }) {
    return this.prisma.document.create({ data });
  }

  async findAll(companyId: string) {
    return this.prisma.document.findMany({
      where: { employee: { companyId } },
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
