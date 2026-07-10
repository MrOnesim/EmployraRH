import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CandidateService', () => {
  let service: CandidateService;
  let prisma: any;

  const mockCandidate = {
    id: 'cand-1',
    jobOfferId: 'offer-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '123456789',
    status: 'received',
    appliedAt: new Date(),
    interviewDate: null,
  };

  const mockJobOffer = { id: 'offer-1', title: 'Developer', status: 'open', department: 'Engineering' };

  beforeEach(async () => {
    prisma = {
      candidate: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      jobOffer: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
  });

  describe('findByJobOffer', () => {
    it('should return candidates for a job offer', async () => {
      prisma.candidate.findMany.mockResolvedValue([mockCandidate]);

      const result = await service.findByJobOffer('offer-1');

      expect(result).toHaveLength(1);
      expect(prisma.candidate.findMany).toHaveBeenCalledWith({
        where: { jobOfferId: 'offer-1' },
        orderBy: { appliedAt: 'desc' },
      });
    });
  });

  describe('findByCompany', () => {
    it('should return candidates for a company', async () => {
      prisma.candidate.findMany.mockResolvedValue([mockCandidate]);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.candidate.findMany).toHaveBeenCalledWith({
        where: { jobOffer: { companyId: 'comp-1' } },
        include: { jobOffer: { select: { id: true, title: true, department: true } } },
        orderBy: { appliedAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a candidate by id', async () => {
      prisma.candidate.findUnique.mockResolvedValue(mockCandidate);

      const result = await service.findById('cand-1');

      expect(result.id).toBe('cand-1');
    });

    it('should throw when candidate not found', async () => {
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.findById('cand-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('apply', () => {
    const applyData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123456789',
    };

    it('should apply successfully to an open job offer', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue(mockJobOffer);
      prisma.candidate.create.mockResolvedValue(mockCandidate);

      const result = await service.apply('offer-1', applyData);

      expect(result).toEqual(mockCandidate);
      expect(prisma.candidate.create).toHaveBeenCalledWith({
        data: { ...applyData, jobOfferId: 'offer-1', status: 'received' },
      });
    });

    it('should throw when job offer not found', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue(null);

      await expect(service.apply('offer-unknown', applyData)).rejects.toThrow(NotFoundException);
    });

    it('should throw when job offer is not open', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, status: 'closed' });

      await expect(service.apply('offer-1', applyData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should transition from received to interview', async () => {
      prisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      prisma.candidate.update.mockResolvedValue({ ...mockCandidate, status: 'interview' });

      const result = await service.updateStatus('cand-1', 'interview');

      expect(result.status).toBe('interview');
    });

    it('should transition from interview to accepted', async () => {
      prisma.candidate.findUnique.mockResolvedValue({ ...mockCandidate, status: 'interview' });
      prisma.candidate.update.mockResolvedValue({ ...mockCandidate, status: 'accepted' });

      const result = await service.updateStatus('cand-1', 'accepted');

      expect(result.status).toBe('accepted');
    });

    it('should throw on invalid transition', async () => {
      prisma.candidate.findUnique.mockResolvedValue(mockCandidate);

      await expect(service.updateStatus('cand-1', 'accepted')).rejects.toThrow(BadRequestException);
    });

    it('should throw when candidate not found', async () => {
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('cand-unknown', 'interview')).rejects.toThrow(NotFoundException);
    });
  });

  describe('scheduleInterview', () => {
    const futureDate = new Date('2026-08-15');

    it('should schedule interview successfully', async () => {
      prisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      prisma.candidate.update.mockResolvedValue({ ...mockCandidate, interviewDate: futureDate, status: 'interview' });

      const result = await service.scheduleInterview('cand-1', futureDate);

      expect(result.status).toBe('interview');
      expect(result.interviewDate).toEqual(futureDate);
    });

    it('should throw when candidate is accepted', async () => {
      prisma.candidate.findUnique.mockResolvedValue({ ...mockCandidate, status: 'accepted' });

      await expect(service.scheduleInterview('cand-1', futureDate)).rejects.toThrow(BadRequestException);
    });

    it('should throw when candidate is rejected', async () => {
      prisma.candidate.findUnique.mockResolvedValue({ ...mockCandidate, status: 'rejected' });

      await expect(service.scheduleInterview('cand-1', futureDate)).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a candidate', async () => {
      prisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      prisma.candidate.update.mockResolvedValue({ ...mockCandidate, status: 'rejected' });

      const result = await service.reject('cand-1');

      expect(result.status).toBe('rejected');
    });

    it('should throw when candidate is already accepted', async () => {
      prisma.candidate.findUnique.mockResolvedValue({ ...mockCandidate, status: 'accepted' });

      await expect(service.reject('cand-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when candidate is already rejected', async () => {
      prisma.candidate.findUnique.mockResolvedValue({ ...mockCandidate, status: 'rejected' });

      await expect(service.reject('cand-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create a candidate', async () => {
      const createData = { jobOfferId: 'offer-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' };
      prisma.candidate.create.mockResolvedValue({ id: 'cand-new', ...createData });

      const result = await service.create(createData);

      expect(result.id).toBe('cand-new');
      expect(prisma.candidate.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('update', () => {
    it('should update a candidate', async () => {
      prisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      prisma.candidate.update.mockResolvedValue({ ...mockCandidate, notes: 'Updated notes' });

      const result = await service.update('cand-1', { notes: 'Updated notes' });

      expect(result.notes).toBe('Updated notes');
    });

    it('should throw when candidate not found', async () => {
      prisma.candidate.findUnique.mockResolvedValue(null);

      await expect(service.update('cand-unknown', { notes: 'test' })).rejects.toThrow(NotFoundException);
    });
  });
});
