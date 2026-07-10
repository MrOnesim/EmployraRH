import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async findByCourse(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: { _count: { select: { attempts: true } } },
    });
  }

  async findById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { _count: { select: { attempts: true } }, course: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    const { _count, ...data } = quiz;
    return { ...data, attemptCount: _count.attempts };
  }

  async create(data: { courseId: string; title: string; description?: string; passingScore?: number; timeLimit?: number; questions?: any }) {
    const course = await this.prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const passingScore = data.passingScore ?? 70;
    const timeLimit = data.timeLimit ?? 30;

    if (passingScore < 0 || passingScore > 100) {
      throw new BadRequestException('Passing score must be between 0 and 100');
    }
    if (timeLimit <= 0) {
      throw new BadRequestException('Time limit must be greater than 0');
    }

    return this.prisma.quiz.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        passingScore,
        timeLimit,
        questions: data.questions || [],
      },
    });
  }

  async update(id: string, data: { title?: string; description?: string; passingScore?: number; timeLimit?: number; questions?: any }) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    if (data.passingScore !== undefined && (data.passingScore < 0 || data.passingScore > 100)) {
      throw new BadRequestException('Passing score must be between 0 and 100');
    }
    if (data.timeLimit !== undefined && data.timeLimit <= 0) {
      throw new BadRequestException('Time limit must be greater than 0');
    }

    return this.prisma.quiz.update({ where: { id }, data });
  }
}
