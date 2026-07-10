import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

  async findByJobOffer(jobOfferId: string) {
    return this.prisma.candidate.findMany({ where: { jobOfferId }, orderBy: { appliedAt: 'desc' } });
  }

  async findByCompany(companyId: string) {
    return this.prisma.candidate.findMany({
      where: { jobOffer: { companyId } },
      include: { jobOffer: { select: { id: true, title: true, department: true } } },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: { jobOffer: { select: { id: true, title: true, department: true } } },
    });
    if (!candidate) throw new NotFoundException(`Candidate with id "${id}" not found`);
    return candidate;
  }

  async apply(jobOfferId: string, data: {
    firstName: string; lastName: string; email: string; phone?: string;
    coverLetter?: string; resumeUrl?: string;
  }) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id: jobOfferId } });
    if (!offer) throw new NotFoundException(`Job offer with id "${jobOfferId}" not found`);
    if (offer.status !== 'open') throw new BadRequestException('Cannot apply to a non-open job offer');

    return this.prisma.candidate.create({
      data: { ...data, jobOfferId, status: 'received' },
    });
  }

  async updateStatus(id: string, status: string) {
    const candidate = await this.findById(id);
    const validTransitions: Record<string, string[]> = {
      received: ['interview', 'rejected'],
      interview: ['accepted', 'rejected'],
      accepted: [],
      rejected: [],
    };
    const allowed = validTransitions[candidate.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from "${candidate.status}" to "${status}"`);
    }
    return this.prisma.candidate.update({ where: { id }, data: { status } });
  }

  async scheduleInterview(id: string, date: Date) {
    const candidate = await this.findById(id);
    if (candidate.status === 'accepted' || candidate.status === 'rejected') {
      throw new BadRequestException(`Cannot schedule interview for a ${candidate.status} candidate`);
    }
    return this.prisma.candidate.update({
      where: { id },
      data: { interviewDate: date, status: 'interview' },
    });
  }

  async reject(id: string) {
    const candidate = await this.findById(id);
    if (candidate.status === 'accepted' || candidate.status === 'rejected') {
      throw new BadRequestException(`Candidate is already ${candidate.status}`);
    }
    return this.prisma.candidate.update({ where: { id }, data: { status: 'rejected' } });
  }

  async create(data: { jobOfferId: string; firstName: string; lastName: string; email: string; phone?: string; coverLetter?: string; resumeUrl?: string }) {
    return this.prisma.candidate.create({ data });
  }

  async update(id: string, data: { status?: string; interviewDate?: Date; notes?: string }) {
    await this.findById(id);
    return this.prisma.candidate.update({ where: { id }, data });
  }
}
