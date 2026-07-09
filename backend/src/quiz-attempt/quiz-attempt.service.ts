import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizAttemptService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.quizAttempt.findMany({ where: { employeeId }, orderBy: { completedAt: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.quizAttempt.findUnique({ where: { id } });
  }

  async create(data: { quizId: string; employeeId: string; score: number; totalPoints: number; answers?: any; passed?: boolean }) {
    return this.prisma.quizAttempt.create({
      data: { ...data, answers: data.answers || [], passed: data.passed || false },
    });
  }
}
