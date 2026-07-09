import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.course.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      include: { enrollments: true },
    });
  }

  async findById(id: string) {
    return this.prisma.course.findUnique({ where: { id }, include: { enrollments: true, quizzes: true } });
  }

  async create(data: { title: string; description?: string; category: string; duration: number; instructor: string; lessons?: any; companyId: string }) {
    return this.prisma.course.create({ data: { ...data, lessons: data.lessons || [] } });
  }

  async update(id: string, data: any) {
    return this.prisma.course.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}
