import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PerformanceReviewService } from './performance-review.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PerformanceReviewService', () => {
  let service: PerformanceReviewService;
  let prisma: any;

  const mockEmployee = { id: 'emp-1', companyId: 'comp-1' };
  const mockReview = { id: 'rev-1', employeeId: 'emp-1', reviewerId: 'user-1', rating: 4, status: 'draft', feedback: null, strengths: [], improvements: [], objectiveIds: [], reviewDate: new Date(), createdAt: new Date() };

  beforeEach(async () => {
    prisma = {
      employee: { findUnique: vi.fn() },
      performanceReview: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceReviewService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PerformanceReviewService>(PerformanceReviewService);
  });

  describe('create', () => {
    it('should create a performance review', async () => {
      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.performanceReview.create.mockImplementation((d: any) => Promise.resolve({ id: 'rev-new', ...d.data }));

      const result = await service.create({ employeeId: 'emp-1', reviewerId: 'user-1', rating: 4 });

      expect(result).toBeDefined();
      expect(result.rating).toBe(4);
      expect(result.status).toBe('draft');
    });

    it('should reject rating > 5', async () => {
      await expect(service.create({ employeeId: 'emp-1', reviewerId: 'user-1', rating: 6 })).rejects.toThrow(BadRequestException);
    });

    it('should reject rating < 0', async () => {
      await expect(service.create({ employeeId: 'emp-1', reviewerId: 'user-1', rating: -1 })).rejects.toThrow(BadRequestException);
    });

    it('should throw if employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.create({ employeeId: 'emp-xxx', reviewerId: 'user-1', rating: 3 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should submit a draft review', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue(mockReview);
      prisma.performanceReview.update.mockResolvedValue({ ...mockReview, status: 'submitted' });

      const result = await service.submit('rev-1');

      expect(result.status).toBe('submitted');
    });

    it('should reject if not draft', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue({ ...mockReview, status: 'submitted' });

      await expect(service.submit('rev-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge a submitted review', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue({ ...mockReview, status: 'submitted' });
      prisma.performanceReview.update.mockResolvedValue({ ...mockReview, status: 'acknowledged' });

      const result = await service.acknowledge('rev-1', 'emp-1');

      expect(result.status).toBe('acknowledged');
    });

    it('should reject if not submitted', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue(mockReview);

      await expect(service.acknowledge('rev-1', 'emp-1')).rejects.toThrow(BadRequestException);
    });

    it('should reject if wrong employee', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue({ ...mockReview, status: 'submitted' });

      await expect(service.acknowledge('rev-1', 'emp-other')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a draft review', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue(mockReview);
      prisma.performanceReview.update.mockResolvedValue({ ...mockReview, rating: 5 });

      const result = await service.update('rev-1', { rating: 5 });

      expect(result.rating).toBe(5);
    });

    it('should reject if not draft', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue({ ...mockReview, status: 'submitted' });

      await expect(service.update('rev-1', { rating: 5 })).rejects.toThrow(BadRequestException);
    });

    it('should reject rating > 5 on update', async () => {
      prisma.performanceReview.findUnique.mockResolvedValue(mockReview);

      await expect(service.update('rev-1', { rating: 6 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCompany', () => {
    it('should return reviews for a company', async () => {
      prisma.performanceReview.findMany.mockResolvedValue([mockReview]);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.performanceReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { employee: { companyId: 'comp-1' } } }),
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return reviews for an employee', async () => {
      prisma.performanceReview.findMany.mockResolvedValue([mockReview]);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.performanceReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { employeeId: 'emp-1' } }),
      );
    });
  });

  describe('findByReviewer', () => {
    it('should return reviews by reviewer', async () => {
      prisma.performanceReview.findMany.mockResolvedValue([mockReview]);

      const result = await service.findByReviewer('user-1');

      expect(result).toHaveLength(1);
      expect(prisma.performanceReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { reviewerId: 'user-1' } }),
      );
    });
  });
});
