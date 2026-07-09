import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SignatureTemplateService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.signatureTemplate.findMany(companyId ? { where: { companyId } } : undefined);
  }

  async findById(id: string) {
    return this.prisma.signatureTemplate.findUnique({ where: { id } });
  }

  async create(data: { name: string; description?: string; documentType: string; content: string; placeholders?: any; companyId: string }) {
    return this.prisma.signatureTemplate.create({
      data: { ...data, placeholders: data.placeholders || [] },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.signatureTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.signatureTemplate.delete({ where: { id } });
  }
}
