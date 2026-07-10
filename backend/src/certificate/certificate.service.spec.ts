import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CertificateService', () => {
  let service: CertificateService;
  let prisma: any;

  const mockCertificate = {
    id: 'cert-1',
    courseId: 'course-1',
    employeeId: 'emp-1',
    issuedAt: new Date(),
    certificateUrl: 'https://example.com/cert',
    verifiedById: null,
    course: { id: 'course-1', title: 'Test Course' },
    employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe' },
  };

  const mockCourse = { id: 'course-1', title: 'Test Course', quizzes: [] };
  const mockEmployee = { id: 'emp-1', firstName: 'John' };

  beforeEach(async () => {
    prisma = {
      certificate: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      course: { findUnique: vi.fn() },
      employee: { findUnique: vi.fn() },
      quizAttempt: { findFirst: vi.fn() },
      securityGuard: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
  });

  describe('findByEmployee', () => {
    it('should return certificates for an employee', async () => {
      prisma.certificate.findMany.mockResolvedValue([mockCertificate]);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.certificate.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        include: { course: true },
        orderBy: { issuedAt: 'desc' },
      });
    });
  });

  describe('findByCourse', () => {
    it('should return certificates for a course', async () => {
      prisma.certificate.findMany.mockResolvedValue([mockCertificate]);

      const result = await service.findByCourse('course-1');

      expect(result).toHaveLength(1);
      expect(prisma.certificate.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        include: { employee: true },
        orderBy: { issuedAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a certificate by id', async () => {
      prisma.certificate.findUnique.mockResolvedValue(mockCertificate);

      const result = await service.findById('cert-1');

      expect(result.id).toBe('cert-1');
    });

    it('should throw when certificate not found', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);

      await expect(service.findById('cert-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generate', () => {
    it('should generate a certificate successfully', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.certificate.findFirst.mockResolvedValue(null);
      prisma.certificate.create.mockResolvedValue(mockCertificate);

      const result = await service.generate('course-1', 'emp-1', 'https://example.com/cert');

      expect(result).toEqual(mockCertificate);
    });

    it('should throw when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.generate('course-unknown', 'emp-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when employee not found', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.generate('course-1', 'emp-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw when certificate already exists', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.certificate.findFirst.mockResolvedValue(mockCertificate);

      await expect(service.generate('course-1', 'emp-1')).rejects.toThrow(ConflictException);
    });

    it('should throw when employee has not passed all quizzes', async () => {
      const courseWithQuizzes = {
        ...mockCourse,
        quizzes: [{ id: 'quiz-1' }, { id: 'quiz-2' }],
      };
      prisma.course.findUnique.mockResolvedValue(courseWithQuizzes);
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.quizAttempt.findFirst.mockResolvedValue(null);

      await expect(service.generate('course-1', 'emp-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verify', () => {
    it('should verify a certificate', async () => {
      prisma.certificate.findUnique.mockResolvedValue(mockCertificate);
      prisma.securityGuard.findUnique.mockResolvedValue({ id: 'guard-1' });
      prisma.certificate.update.mockResolvedValue({ ...mockCertificate, verifiedById: 'guard-1' });

      const result = await service.verify('cert-1', 'guard-1');

      expect(result.verifiedById).toBe('guard-1');
    });

    it('should throw when certificate not found', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);

      await expect(service.verify('cert-unknown', 'guard-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when security guard not found', async () => {
      prisma.certificate.findUnique.mockResolvedValue(mockCertificate);
      prisma.securityGuard.findUnique.mockResolvedValue(null);

      await expect(service.verify('cert-1', 'guard-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
