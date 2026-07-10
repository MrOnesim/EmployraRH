import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseService } from './course.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CourseService', () => {
  let service: CourseService;
  let prisma: any;

  const mockCourse = {
    id: 'course-1',
    title: 'Test Course',
    description: 'A test course',
    category: 'development',
    duration: 120,
    instructor: 'John Doe',
    lessons: ['lesson-1', 'lesson-2'],
    companyId: 'comp-1',
    enrolledCount: 0,
  };

  beforeEach(async () => {
    prisma = {
      course: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: {},
        include: { enrollments: true, quizzes: true },
      });
    });

    it('should filter by company', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.findAll('comp-1');

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        include: { enrollments: true, quizzes: true },
      });
    });
  });

  describe('findByCompany', () => {
    it('should return courses with enrollment and quiz counts', async () => {
      prisma.course.findMany.mockResolvedValue([
        { ...mockCourse, _count: { enrollments: 3, quizzes: 2 } },
      ]);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(result[0].enrollmentCount).toBe(3);
      expect(result[0].quizCount).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return a course by id', async () => {
      prisma.course.findUnique.mockResolvedValue({
        ...mockCourse,
        enrollments: [],
        quizzes: [],
        _count: { certificates: 5 },
      });

      const result = await service.findById('course-1');

      expect(result.id).toBe('course-1');
      expect(result.certificatesCount).toBe(5);
    });

    it('should throw when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findById('course-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a course', async () => {
      const createData = {
        title: 'New Course',
        category: 'design',
        duration: 60,
        instructor: 'Jane Doe',
        companyId: 'comp-1',
      };
      prisma.course.create.mockResolvedValue({ id: 'course-new', ...createData, lessons: [] });

      const result = await service.create(createData);

      expect(result.id).toBe('course-new');
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: { ...createData, lessons: [] },
      });
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.course.update.mockResolvedValue({ ...mockCourse, title: 'Updated Title' });

      const result = await service.update('course-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.update('course-unknown', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a course with no enrollments', async () => {
      prisma.course.findUnique.mockResolvedValue({
        ...mockCourse,
        _count: { enrollments: 0 },
      });
      prisma.course.delete.mockResolvedValue(mockCourse);

      const result = await service.delete('course-1');

      expect(result).toEqual(mockCourse);
    });

    it('should throw when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.delete('course-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw when course has active enrollments', async () => {
      prisma.course.findUnique.mockResolvedValue({
        ...mockCourse,
        _count: { enrollments: 3 },
      });

      await expect(service.delete('course-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findPublished', () => {
    it('should return all courses', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.findPublished();

      expect(result).toHaveLength(1);
      expect(prisma.course.findMany).toHaveBeenCalledWith({
        include: { enrollments: true, quizzes: true },
      });
    });
  });
});
