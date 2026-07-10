import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.enrollment.findMany({ where: { employeeId }, include: { course: true } });
  }

  async findByCourse(courseId: string) {
    return this.prisma.enrollment.findMany({ where: { courseId }, include: { employee: true } });
  }

  async findByCompany(companyId: string) {
    return this.prisma.enrollment.findMany({
      where: { employee: { companyId } },
      include: { employee: true, course: true },
    });
  }

  async findById(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async create(data: { employeeId: string; courseId: string }) {
    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const course = await this.prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.enrollment.findUnique({
      where: { employeeId_courseId: { employeeId: data.employeeId, courseId: data.courseId } },
    });
    if (existing) throw new ConflictException('Employee is already enrolled in this course');

    const enrollment = await this.prisma.enrollment.create({
      data: { employeeId: data.employeeId, courseId: data.courseId, status: 'enrolled' },
    });

    await this.prisma.course.update({
      where: { id: data.courseId },
      data: { enrolledCount: { increment: 1 } },
    });

    return enrollment;
  }

  async update(id: string, data: { progress?: number; completedLessons?: string[]; status?: string; completedAt?: Date }) {
    const enrollment = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return this.prisma.enrollment.update({ where: { id }, data });
  }

  async completeLesson(id: string, lessonId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const lessons = (enrollment.course.lessons as any[]) || [];
    if (lessons.length === 0) throw new BadRequestException('Course has no lessons');

    const alreadyCompleted = enrollment.completedLessons.includes(lessonId);
    const completedLessons = alreadyCompleted
      ? enrollment.completedLessons
      : [...enrollment.completedLessons, lessonId];

    const progress = Math.round((completedLessons.length / lessons.length) * 100);
    const isCompleted = progress >= 100;

    return this.prisma.enrollment.update({
      where: { id },
      data: {
        completedLessons,
        progress,
        status: isCompleted ? 'completed' : progress > 0 ? 'in_progress' : 'enrolled',
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
    });
  }
}
