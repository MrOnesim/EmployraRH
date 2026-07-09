import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

  async findByJobOffer(jobOfferId: string) {
    return this.prisma.candidate.findMany({ where: { jobOfferId }, orderBy: { appliedAt: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.candidate.findUnique({ where: { id } });
  }

  async create(data: { jobOfferId: string; firstName: string; lastName: string; email: string; phone?: string; coverLetter?: string; resumeUrl?: string }) {
    return this.prisma.candidate.create({ data });
  }

  async update(id: string, data: { status?: string; interviewDate?: Date; notes?: string }) {
    return this.prisma.candidate.update({ where: { id }, data });
  }
}
