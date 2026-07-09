import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async findByCourse(courseId: string) {
    return this.prisma.quiz.findMany({ where: { courseId } });
  }

  async findById(id: string) {
    return this.prisma.quiz.findUnique({ where: { id }, include: { attempts: true } });
  }

  async create(data: { courseId: string; title: string; description?: string; passingScore?: number; timeLimit?: number; questions?: any }) {
    return this.prisma.quiz.create({ data: { ...data, passingScore: data.passingScore || 70, timeLimit: data.timeLimit || 30, questions: data.questions || [] } });
  }
}
