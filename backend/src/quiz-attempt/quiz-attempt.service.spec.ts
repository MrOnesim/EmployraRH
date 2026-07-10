import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QuizAttemptService', () => {
  let service: QuizAttemptService;
  let prisma: any;

  const mockEmployee = { id: 'emp-1' };
  const mockQuiz = {
    id: 'quiz-1',
    courseId: 'course-1',
    passingScore: 2,
    questions: [
      { id: 'q1', text: 'Q1', options: ['A', 'B'], correctAnswer: 0, points: 1 },
      { id: 'q2', text: 'Q2', options: ['A', 'B'], correctAnswer: 1, points: 1 },
    ],
  };
  const mockAttempt = {
    id: 'att-1',
    quizId: 'quiz-1',
    employeeId: 'emp-1',
    score: 2,
    totalPoints: 2,
    answers: [0, 1],
    passed: true,
    completedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      quizAttempt: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      employee: { findUnique: vi.fn() },
      quiz: { findUnique: vi.fn() },
      course: { findUnique: vi.fn() },
      certificate: { findFirst: vi.fn(), create: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAttemptService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QuizAttemptService>(QuizAttemptService);
  });

  describe('findByEmployee', () => {
    it('should return attempts for an employee', async () => {
      prisma.quizAttempt.findMany.mockResolvedValue([{ ...mockAttempt, quiz: mockQuiz }]);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        include: { quiz: true },
        orderBy: { completedAt: 'desc' },
      });
    });
  });

  describe('findByQuiz', () => {
    it('should return attempts for a quiz', async () => {
      prisma.quizAttempt.findMany.mockResolvedValue([{ ...mockAttempt, employee: mockEmployee }]);

      const result = await service.findByQuiz('quiz-1');

      expect(result).toHaveLength(1);
      expect(prisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: { quizId: 'quiz-1' },
        include: { employee: true },
        orderBy: { completedAt: 'desc' },
      });
    });
  });

  describe('findByCourse', () => {
    it('should return attempts for a course', async () => {
      prisma.quizAttempt.findMany.mockResolvedValue([{ ...mockAttempt, quiz: mockQuiz, employee: mockEmployee }]);

      const result = await service.findByCourse('course-1');

      expect(result).toHaveLength(1);
      expect(prisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: { quiz: { courseId: 'course-1' } },
        include: { quiz: true, employee: true },
        orderBy: { completedAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return an attempt by id', async () => {
      prisma.quizAttempt.findUnique.mockResolvedValue({
        ...mockAttempt,
        quiz: { ...mockQuiz, course: { id: 'course-1' } },
        employee: mockEmployee,
      });

      const result = await service.findById('att-1');

      expect(result.id).toBe('att-1');
    });

    it('should throw when attempt not found', async () => {
      prisma.quizAttempt.findUnique.mockResolvedValue(null);

      await expect(service.findById('att-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should submit a quiz and pass', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);
      prisma.quizAttempt.create.mockResolvedValue(mockAttempt);
      prisma.course.findUnique.mockResolvedValue({
        id: 'course-1',
        quizzes: [mockQuiz],
        enrollments: [{ id: 'enr-1', status: 'completed' }],
      });
      prisma.certificate.findFirst.mockResolvedValue(null);
      prisma.certificate.create.mockResolvedValue({ id: 'cert-1', employeeId: 'emp-1', courseId: 'course-1' });

      const result = await service.submit('quiz-1', 'emp-1', [0, 1]);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(2);
    });

    it('should submit a quiz and fail', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);
      prisma.quizAttempt.create.mockResolvedValue({ ...mockAttempt, score: 1, passed: false, answers: [0, 0] });

      const result = await service.submit('quiz-1', 'emp-1', [0, 0]);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(1);
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.submit('quiz-1', 'emp-unknown', [0, 1])).rejects.toThrow(NotFoundException);
    });

    it('should throw when quiz not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.quiz.findUnique.mockResolvedValue(null);

      await expect(service.submit('quiz-unknown', 'emp-1', [0, 1])).rejects.toThrow(NotFoundException);
    });

    it('should throw when quiz has no questions', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.quiz.findUnique.mockResolvedValue({ ...mockQuiz, questions: [] });

      await expect(service.submit('quiz-1', 'emp-1', [])).rejects.toThrow(BadRequestException);
    });

    it('should throw when answer count mismatches question count', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);

      await expect(service.submit('quiz-1', 'emp-1', [0])).rejects.toThrow(BadRequestException);
    });
  });
});
