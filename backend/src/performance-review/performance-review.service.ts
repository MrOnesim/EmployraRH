import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PerformanceReviewService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.performanceReview.findMany({ where: { employeeId }, orderBy: { reviewDate: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.performanceReview.findUnique({ where: { id } });
  }

  async create(data: { employeeId: string; reviewerId: string; rating: number; feedback?: string; strengths?: string[]; improvements?: string[]; objectiveIds?: string[] }) {
    return this.prisma.performanceReview.create({
      data: { ...data, strengths: data.strengths || [], improvements: data.improvements || [], objectiveIds: data.objectiveIds || [] },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.performanceReview.update({ where: { id }, data });
  }
}
