import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};
    return this.prisma.course.findMany({ where, include: { enrollments: true, quizzes: true } });
  }

  async findByCompany(companyId: string) {
    const courses = await this.prisma.course.findMany({
      where: { companyId },
      include: { _count: { select: { enrollments: true, quizzes: true } } },
    });
    return courses.map(({ _count, ...c }) => ({ ...c, enrollmentCount: _count.enrollments, quizCount: _count.quizzes }));
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: { include: { employee: true } },
        quizzes: true,
        _count: { select: { certificates: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    const { _count, ...data } = course;
    return { ...data, certificatesCount: _count.certificates };
  }

  async create(data: { title: string; description?: string; category: string; duration: number; instructor: string; lessons?: any; companyId: string }) {
    return this.prisma.course.create({ data: { ...data, lessons: data.lessons || [] } });
  }

  async update(id: string, data: any) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({ where: { id }, data });
  }

  async delete(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id }, include: { _count: { select: { enrollments: true } } } });
    if (!course) throw new NotFoundException('Course not found');
    if (course._count.enrollments > 0) throw new BadRequestException('Cannot delete course with active enrollments');
    return this.prisma.course.delete({ where: { id } });
  }

  async findPublished() {
    return this.prisma.course.findMany({ include: { enrollments: true, quizzes: true } });
  }
}
