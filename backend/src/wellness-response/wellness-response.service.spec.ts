import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { WellnessResponseService } from './wellness-response.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WellnessResponseService', () => {
  let service: WellnessResponseService;
  let prisma: any;

  const mockSurvey = {
    id: 'survey-1',
    title: 'Employee Satisfaction',
    active: true,
    expiresAt: new Date(Date.now() + 86400000),
    companyId: 'comp-1',
  };

  const mockResponse = {
    id: 'resp-1',
    surveyId: 'survey-1',
    employeeId: 'emp-1',
    answers: { q1: 5, q2: 4 },
    anonymous: false,
    submittedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      wellnessResponse: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      wellnessSurvey: { findUnique: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WellnessResponseService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WellnessResponseService>(WellnessResponseService);
  });

  describe('findBySurvey', () => {
    it('should return responses for a survey', async () => {
      prisma.wellnessResponse.findMany.mockResolvedValue([mockResponse]);
      const result = await service.findBySurvey('survey-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByEmployee', () => {
    it('should return responses for an employee', async () => {
      prisma.wellnessResponse.findMany.mockResolvedValue([mockResponse]);
      const result = await service.findByEmployee('emp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByCompany', () => {
    it('should return responses for a company', async () => {
      prisma.wellnessResponse.findMany.mockResolvedValue([mockResponse]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a response by id', async () => {
      prisma.wellnessResponse.findUnique.mockResolvedValue(mockResponse);
      const result = await service.findById('resp-1');
      expect(result.id).toBe('resp-1');
    });

    it('should throw when not found', async () => {
      prisma.wellnessResponse.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should submit a response successfully', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(mockSurvey);
      prisma.wellnessResponse.findUnique.mockResolvedValue(null);
      prisma.wellnessResponse.create.mockResolvedValue(mockResponse);
      const result = await service.submit('survey-1', 'emp-1', { q1: 5, q2: 4 });
      expect(result).toEqual(mockResponse);
    });

    it('should throw when survey not found', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(null);
      await expect(service.submit('survey-unknown', 'emp-1', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw when survey is not active', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue({ ...mockSurvey, active: false });
      await expect(service.submit('survey-1', 'emp-1', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw when survey has expired', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue({ ...mockSurvey, expiresAt: new Date(Date.now() - 86400000) });
      await expect(service.submit('survey-1', 'emp-1', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw when duplicate response exists', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(mockSurvey);
      prisma.wellnessResponse.findUnique.mockResolvedValue(mockResponse);
      await expect(service.submit('survey-1', 'emp-1', {})).rejects.toThrow(ConflictException);
    });
  });

  describe('create', () => {
    it('should create a response directly', async () => {
      prisma.wellnessResponse.create.mockResolvedValue(mockResponse);
      const result = await service.create({ surveyId: 'survey-1', employeeId: 'emp-1' });
      expect(result).toEqual(mockResponse);
    });
  });
});
