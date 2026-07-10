import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QuizService', () => {
  let service: QuizService;
  let prisma: any;

  const mockQuiz = {
    id: 'quiz-1',
    courseId: 'course-1',
    title: 'Test Quiz',
    description: 'A test quiz',
    passingScore: 70,
    timeLimit: 30,
    questions: [
      { id: 'q1', text: 'Question 1', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, points: 1 },
      { id: 'q2', text: 'Question 2', options: ['A', 'B', 'C', 'D'], correctAnswer: 2, points: 1 },
    ],
  };

  beforeEach(async () => {
    prisma = {
      quiz: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      course: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  describe('findByCourse', () => {
    it('should return quizzes for a course', async () => {
      prisma.quiz.findMany.mockResolvedValue([mockQuiz]);

      const result = await service.findByCourse('course-1');

      expect(result).toHaveLength(1);
      expect(prisma.quiz.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        include: { _count: { select: { attempts: true } } },
      });
    });
  });

  describe('findById', () => {
    it('should return a quiz by id', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...mockQuiz, _count: { attempts: 5 }, course: { id: 'course-1' } });

      const result = await service.findById('quiz-1');

      expect(result.id).toBe('quiz-1');
      expect(result.attemptCount).toBe(5);
    });

    it('should throw when quiz not found', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);

      await expect(service.findById('quiz-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a quiz with defaults', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'course-1' });
      prisma.quiz.create.mockResolvedValue(mockQuiz);

      const result = await service.create({ courseId: 'course-1', title: 'Test Quiz' });

      expect(result).toEqual(mockQuiz);
      expect(prisma.quiz.create).toHaveBeenCalledWith({
        data: {
          courseId: 'course-1',
          title: 'Test Quiz',
          description: undefined,
          passingScore: 70,
          timeLimit: 30,
          questions: [],
        },
      });
    });

    it('should throw when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.create({ courseId: 'course-unknown', title: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw when passing score is out of range', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'course-1' });

      await expect(service.create({ courseId: 'course-1', title: 'Test', passingScore: 150 })).rejects.toThrow(BadRequestException);
    });

    it('should throw when time limit is zero', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'course-1' });

      await expect(service.create({ courseId: 'course-1', title: 'Test', timeLimit: 0 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a quiz', async () => {
      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);
      prisma.quiz.update.mockResolvedValue({ ...mockQuiz, title: 'Updated Quiz' });

      const result = await service.update('quiz-1', { title: 'Updated Quiz' });

      expect(result.title).toBe('Updated Quiz');
    });

    it('should throw when quiz not found', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);

      await expect(service.update('quiz-unknown', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw when passing score is out of range', async () => {
      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);

      await expect(service.update('quiz-1', { passingScore: -5 })).rejects.toThrow(BadRequestException);
    });

    it('should throw when time limit is invalid', async () => {
      prisma.quiz.findUnique.mockResolvedValue(mockQuiz);

      await expect(service.update('quiz-1', { timeLimit: -1 })).rejects.toThrow(BadRequestException);
    });
  });
});
