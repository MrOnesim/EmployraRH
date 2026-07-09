import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SignatureRequestService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.signatureRequest.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.signatureRequest.findUnique({ where: { id } });
  }

  async create(data: { documentName: string; documentType: string; initiatedBy: string; initiatedByName: string; companyId: string; message?: string; recipients?: any; expiresAt?: Date }) {
    return this.prisma.signatureRequest.create({
      data: { ...data, recipients: data.recipients || [] },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.signatureRequest.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.signatureRequest.delete({ where: { id } });
  }
}
