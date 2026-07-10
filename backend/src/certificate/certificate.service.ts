import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.certificate.findMany({
      where: { employeeId },
      include: { course: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findByCourse(courseId: string) {
    return this.prisma.certificate.findMany({
      where: { courseId },
      include: { employee: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: { course: true, employee: true },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }

  async generate(courseId: string, employeeId: string, certificateUrl?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { quizzes: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    if (course.quizzes.length > 0) {
      const allPassed = await Promise.all(
        course.quizzes.map(async (quiz) => {
          const passedAttempt = await this.prisma.quizAttempt.findFirst({
            where: { quizId: quiz.id, employeeId, passed: true },
          });
          return !!passedAttempt;
        }),
      );

      if (!allPassed.every(Boolean)) {
        throw new BadRequestException('Employee has not passed all quizzes in this course');
      }
    }

    const existing = await this.prisma.certificate.findFirst({
      where: { employeeId, courseId },
    });
    if (existing) throw new ConflictException('Certificate already exists for this employee and course');

    return this.prisma.certificate.create({
      data: { employeeId, courseId, issuedAt: new Date(), certificateUrl },
    });
  }

  async verify(id: string, verifiedById: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Certificate not found');

    const guard = await this.prisma.securityGuard.findUnique({ where: { id: verifiedById } });
    if (!guard) throw new NotFoundException('Security guard not found');

    return this.prisma.certificate.update({
      where: { id },
      data: { verifiedById },
    });
  }
}
