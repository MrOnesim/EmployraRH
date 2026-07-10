import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PerformanceReviewService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.performanceReview.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: { reviewDate: 'desc' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.performanceReview.findMany({
      where: { employeeId },
      orderBy: { reviewDate: 'desc' },
    });
  }

  async findByReviewer(reviewerId: string) {
    return this.prisma.performanceReview.findMany({
      where: { reviewerId },
      orderBy: { reviewDate: 'desc' },
    });
  }

  async findById(id: string) {
    const review = await this.prisma.performanceReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Performance review not found');
    return review;
  }

  async create(data: {
    employeeId: string;
    reviewerId: string;
    rating: number;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    objectiveIds?: string[];
  }) {
    if (data.rating < 0 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 0 and 5');
    }

    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.performanceReview.create({
      data: {
        employeeId: data.employeeId,
        reviewerId: data.reviewerId,
        rating: data.rating,
        feedback: data.feedback,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        objectiveIds: data.objectiveIds || [],
        status: 'draft',
      },
    });
  }

  async update(
    id: string,
    data: {
      rating?: number;
      feedback?: string;
      strengths?: string[];
      improvements?: string[];
      objectiveIds?: string[];
    },
  ) {
    const review = await this.findById(id);
    if (review.status !== 'draft') {
      throw new BadRequestException('Only draft reviews can be updated');
    }
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
      throw new BadRequestException('Rating must be between 0 and 5');
    }
    return this.prisma.performanceReview.update({ where: { id }, data });
  }

  async submit(id: string) {
    const review = await this.findById(id);
    if (review.status !== 'draft') {
      throw new BadRequestException('Only draft reviews can be submitted');
    }
    return this.prisma.performanceReview.update({
      where: { id },
      data: { status: 'submitted' },
    });
  }

  async acknowledge(id: string, employeeId: string) {
    const review = await this.findById(id);
    if (review.status !== 'submitted') {
      throw new BadRequestException('Only submitted reviews can be acknowledged');
    }
    if (review.employeeId !== employeeId) {
      throw new ForbiddenException('Only the subject employee can acknowledge the review');
    }
    return this.prisma.performanceReview.update({
      where: { id },
      data: { status: 'acknowledged' },
    });
  }
}
