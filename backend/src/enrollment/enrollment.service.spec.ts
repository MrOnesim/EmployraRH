import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let prisma: any;

  const mockEmployee = { id: 'emp-1', companyId: 'comp-1' };
  const mockCourse = { id: 'course-1', title: 'Test Course', lessons: ['lesson-1', 'lesson-2'], enrolledCount: 0 };
  const mockEnrollment = {
    id: 'enr-1',
    employeeId: 'emp-1',
    courseId: 'course-1',
    status: 'enrolled',
    progress: 0,
    completedLessons: [],
    completedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      enrollment: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      employee: { findUnique: vi.fn() },
      course: { findUnique: vi.fn(), update: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  describe('findByEmployee', () => {
    it('should return enrollments for an employee', async () => {
      prisma.enrollment.findMany.mockResolvedValue([{ ...mockEnrollment, course: mockCourse }]);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        include: { course: true },
      });
    });
  });

  describe('findByCourse', () => {
    it('should return enrollments for a course', async () => {
      prisma.enrollment.findMany.mockResolvedValue([{ ...mockEnrollment, employee: mockEmployee }]);

      const result = await service.findByCourse('course-1');

      expect(result).toHaveLength(1);
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        include: { employee: true },
      });
    });
  });

  describe('findByCompany', () => {
    it('should return enrollments for a company', async () => {
      prisma.enrollment.findMany.mockResolvedValue([{ ...mockEnrollment, employee: mockEmployee, course: mockCourse }]);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' } },
        include: { employee: true, course: true },
      });
    });
  });

  describe('findById', () => {
    it('should return an enrollment by id', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);

      const result = await service.findById('enr-1');

      expect(result.id).toBe('enr-1');
    });

    it('should throw when enrollment not found', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(service.findById('enr-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an enrollment successfully', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.enrollment.create.mockResolvedValue(mockEnrollment);
      prisma.course.update.mockResolvedValue({ ...mockCourse, enrolledCount: 1 });

      const result = await service.create({ employeeId: 'emp-1', courseId: 'course-1' });

      expect(result).toEqual(mockEnrollment);
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        data: { enrolledCount: { increment: 1 } },
      });
    });

    it('should throw when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.create({ employeeId: 'emp-unknown', courseId: 'course-1' })).rejects.toThrow(NotFoundException);
    });

    it('should throw when course not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.create({ employeeId: 'emp-1', courseId: 'course-unknown' })).rejects.toThrow(NotFoundException);
    });

    it('should throw when already enrolled', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);

      await expect(service.create({ employeeId: 'emp-1', courseId: 'course-1' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an enrollment', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      prisma.enrollment.update.mockResolvedValue({ ...mockEnrollment, progress: 50, status: 'in_progress' });

      const result = await service.update('enr-1', { progress: 50, status: 'in_progress' });

      expect(result.progress).toBe(50);
      expect(result.status).toBe('in_progress');
    });

    it('should throw when enrollment not found', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(service.update('enr-unknown', { progress: 50 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeLesson', () => {
    it('should complete a lesson and update progress', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        completedLessons: [],
        course: { ...mockCourse, lessons: ['lesson-1', 'lesson-2'] },
      });
      prisma.enrollment.update.mockResolvedValue({
        ...mockEnrollment,
        completedLessons: ['lesson-1'],
        progress: 50,
        status: 'in_progress',
      });

      const result = await service.completeLesson('enr-1', 'lesson-1');

      expect(result.progress).toBe(50);
      expect(result.status).toBe('in_progress');
      expect(result.completedLessons).toContain('lesson-1');
    });

    it('should mark as completed when all lessons done', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        completedLessons: ['lesson-1'],
        course: { ...mockCourse, lessons: ['lesson-1', 'lesson-2'] },
      });
      prisma.enrollment.update.mockResolvedValue({
        ...mockEnrollment,
        completedLessons: ['lesson-1', 'lesson-2'],
        progress: 100,
        status: 'completed',
      });

      const result = await service.completeLesson('enr-1', 'lesson-2');

      expect(result.progress).toBe(100);
      expect(result.status).toBe('completed');
    });

    it('should not duplicate already completed lessons', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        completedLessons: ['lesson-1'],
        course: { ...mockCourse, lessons: ['lesson-1', 'lesson-2'] },
      });
      prisma.enrollment.update.mockResolvedValue({
        ...mockEnrollment,
        completedLessons: ['lesson-1'],
        progress: 50,
        status: 'in_progress',
      });

      const result = await service.completeLesson('enr-1', 'lesson-1');

      expect(result.completedLessons).toEqual(['lesson-1']);
    });

    it('should throw when enrollment not found', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(service.completeLesson('enr-unknown', 'lesson-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when course has no lessons', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        course: { ...mockCourse, lessons: [] },
      });

      await expect(service.completeLesson('enr-1', 'lesson-1')).rejects.toThrow(BadRequestException);
    });
  });
});
