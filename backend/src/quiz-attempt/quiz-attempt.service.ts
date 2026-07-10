import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizAttemptService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { employeeId },
      include: { quiz: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findByQuiz(quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quizId },
      include: { employee: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findByCourse(courseId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quiz: { courseId } },
      include: { quiz: true, employee: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id },
      include: { quiz: { include: { course: true } }, employee: true },
    });
    if (!attempt) throw new NotFoundException('Quiz attempt not found');
    return attempt;
  }

  async submit(quizId: string, employeeId: string, answers: number[]) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questions = quiz.questions as any[];
    if (!questions || questions.length === 0) {
      throw new BadRequestException('Quiz has no questions');
    }

    if (answers.length !== questions.length) {
      throw new BadRequestException('Number of answers must match number of questions');
    }

    let score = 0;
    let totalPoints = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const points = q.points || 1;
      totalPoints += points;
      if (answers[i] === q.correctAnswer) {
        score += points;
      }
    }

    const passed = score >= quiz.passingScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        employeeId,
        score,
        totalPoints,
        answers,
        passed,
        completedAt: new Date(),
      },
    });

    if (passed) {
      const course = await this.prisma.course.findUnique({
        where: { id: quiz.courseId },
        include: {
          quizzes: true,
          enrollments: { where: { employeeId, status: 'completed' } },
        },
      });

      if (course && course.enrollments.length > 0) {
        const existingCert = await this.prisma.certificate.findFirst({
          where: { employeeId, courseId: course.id },
        });

        if (!existingCert) {
          await this.prisma.certificate.create({
            data: { employeeId, courseId: course.id, issuedAt: new Date() },
          });
        }
      }
    }

    return attempt;
  }
}
