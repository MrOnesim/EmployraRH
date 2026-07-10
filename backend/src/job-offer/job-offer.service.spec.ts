import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('JobOfferService', () => {
  let service: JobOfferService;
  let prisma: any;

  const mockJobOffer = {
    id: 'offer-1',
    title: 'Software Developer',
    department: 'Engineering',
    description: 'Build awesome things',
    status: 'draft',
    companyId: 'comp-1',
    createdBy: 'user-1',
    createdAt: new Date(),
    salary: 100000,
    location: 'Remote',
    type: 'full-time',
  };

  beforeEach(async () => {
    prisma = {
      jobOffer: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      candidate: { count: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOfferService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<JobOfferService>(JobOfferService);
  });

  describe('findAll', () => {
    it('should return all job offers', async () => {
      prisma.jobOffer.findMany.mockResolvedValue([mockJobOffer]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
    });

    it('should filter by company', async () => {
      prisma.jobOffer.findMany.mockResolvedValue([mockJobOffer]);

      const result = await service.findAll('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        include: { _count: { select: { candidates: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a job offer by id', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, _count: { candidates: 3 }, candidates: [] });

      const result = await service.findById('offer-1');

      expect(result.id).toBe('offer-1');
    });

    it('should throw when job offer not found', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue(null);

      await expect(service.findById('offer-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCompany', () => {
    it('should return job offers for a company', async () => {
      prisma.jobOffer.findMany.mockResolvedValue([mockJobOffer]);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        include: { _count: { select: { candidates: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOpen', () => {
    it('should return open job offers', async () => {
      prisma.jobOffer.findMany.mockResolvedValue([{ ...mockJobOffer, status: 'open' }]);

      const result = await service.findOpen();

      expect(result).toHaveLength(1);
      expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
        where: { status: 'open' },
        include: { _count: { select: { candidates: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByStatus', () => {
    it('should return job offers by status and company', async () => {
      prisma.jobOffer.findMany.mockResolvedValue([{ ...mockJobOffer, status: 'closed' }]);

      const result = await service.findByStatus('comp-1', 'closed');

      expect(result).toHaveLength(1);
      expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1', status: 'closed' },
        include: { _count: { select: { candidates: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getCandidateCount', () => {
    it('should return candidate count', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, _count: { candidates: 5 }, candidates: [] });
      prisma.candidate.count.mockResolvedValue(5);

      const result = await service.getCandidateCount('offer-1');

      expect(result).toBe(5);
    });

    it('should throw when job offer not found', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue(null);

      await expect(service.getCandidateCount('offer-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createData = {
      title: 'New Position',
      department: 'Engineering',
      createdBy: 'user-1',
      companyId: 'comp-1',
    };

    it('should create a job offer as draft', async () => {
      prisma.jobOffer.create.mockResolvedValue({ id: 'offer-new', ...createData, status: 'draft' });

      const result = await service.create(createData);

      expect(result.status).toBe('draft');
    });

    it('should throw when title is empty', async () => {
      await expect(service.create({ ...createData, title: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw when department is empty', async () => {
      await expect(service.create({ ...createData, department: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('publish', () => {
    it('should publish a draft job offer', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, _count: { candidates: 0 }, candidates: [] });
      prisma.jobOffer.update.mockResolvedValue({ ...mockJobOffer, status: 'open' });

      const result = await service.publish('offer-1');

      expect(result.status).toBe('open');
    });

    it('should throw when not in draft status', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, status: 'open', _count: { candidates: 0 }, candidates: [] });

      await expect(service.publish('offer-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('close', () => {
    it('should close an open job offer', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, status: 'open', _count: { candidates: 0 }, candidates: [] });
      prisma.jobOffer.update.mockResolvedValue({ ...mockJobOffer, status: 'closed' });

      const result = await service.close('offer-1');

      expect(result.status).toBe('closed');
    });

    it('should throw when not in open status', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, _count: { candidates: 0 }, candidates: [] });

      await expect(service.close('offer-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a job offer', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, _count: { candidates: 0 }, candidates: [] });
      prisma.jobOffer.update.mockResolvedValue({ ...mockJobOffer, title: 'Updated Title' });

      const result = await service.update('offer-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw when job offer not found', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue(null);

      await expect(service.update('offer-unknown', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a job offer', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue({ ...mockJobOffer, _count: { candidates: 0 }, candidates: [] });
      prisma.jobOffer.delete.mockResolvedValue(mockJobOffer);

      const result = await service.delete('offer-1');

      expect(result).toEqual(mockJobOffer);
    });

    it('should throw when job offer not found', async () => {
      prisma.jobOffer.findUnique.mockResolvedValue(null);

      await expect(service.delete('offer-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
