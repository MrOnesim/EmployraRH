import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobOfferService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.jobOffer.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { id },
      include: { _count: { select: { candidates: true } }, candidates: { orderBy: { appliedAt: 'desc' } } },
    });
    if (!offer) throw new NotFoundException(`Job offer with id "${id}" not found`);
    return offer;
  }

  async findByCompany(companyId: string) {
    return this.prisma.jobOffer.findMany({
      where: { companyId },
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOpen() {
    return this.prisma.jobOffer.findMany({
      where: { status: 'open' },
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(companyId: string, status: string) {
    return this.prisma.jobOffer.findMany({
      where: { companyId, status },
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCandidateCount(id: string) {
    const offer = await this.findById(id);
    return this.prisma.candidate.count({ where: { jobOfferId: id } });
  }

  async create(data: {
    title: string; department: string; description?: string; requirements?: string;
    salary?: number; location?: string; type?: string; createdBy: string; companyId: string;
  }) {
    if (!data.title || !data.title.trim()) throw new BadRequestException('Title is required');
    if (!data.department || !data.department.trim()) throw new BadRequestException('Department is required');
    return this.prisma.jobOffer.create({
      data: { ...data, status: 'draft' },
      include: { _count: { select: { candidates: true } } },
    });
  }

  async publish(id: string) {
    const offer = await this.findById(id);
    if (offer.status !== 'draft') throw new BadRequestException(`Cannot publish offer with status "${offer.status}"`);
    return this.prisma.jobOffer.update({ where: { id }, data: { status: 'open' } });
  }

  async close(id: string) {
    const offer = await this.findById(id);
    if (offer.status !== 'open') throw new BadRequestException(`Cannot close offer with status "${offer.status}"`);
    return this.prisma.jobOffer.update({ where: { id }, data: { status: 'closed' } });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.jobOffer.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.jobOffer.delete({ where: { id } });
  }
}
