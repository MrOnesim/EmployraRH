import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.enrollment.findMany({ where: { employeeId }, include: { course: true } });
  }

  async findById(id: string) {
    return this.prisma.enrollment.findUnique({ where: { id } });
  }

  async create(data: { employeeId: string; courseId: string }) {
    return this.prisma.enrollment.create({ data });
  }

  async update(id: string, data: { progress?: number; completedLessons?: string[]; status?: string; completedAt?: Date }) {
    return this.prisma.enrollment.update({ where: { id }, data });
  }
}
