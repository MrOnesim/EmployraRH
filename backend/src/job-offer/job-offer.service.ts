import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobOfferService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.jobOffer.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      include: { candidates: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.jobOffer.findUnique({ where: { id }, include: { candidates: true } });
  }

  async create(data: { title: string; department: string; description?: string; requirements?: string; salary?: number; location?: string; type?: string; createdBy: string; companyId: string }) {
    return this.prisma.jobOffer.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.jobOffer.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.jobOffer.delete({ where: { id } });
  }
}
