import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WellnessSurveyService } from './wellness-survey.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WellnessSurveyService', () => {
  let service: WellnessSurveyService;
  let prisma: any;

  const mockSurvey = {
    id: 'survey-1',
    title: 'Employee Satisfaction',
    description: 'Annual survey',
    questions: [{ id: 'q1', label: 'How satisfied are you?', type: 'rating' }],
    active: true,
    expiresAt: null,
    companyId: 'comp-1',
    createdAt: new Date(),
    _count: { responses: 0 },
  };

  const mockResponse = {
    id: 'resp-1',
    surveyId: 'survey-1',
    employeeId: 'emp-1',
    answers: { q1: 5 },
    anonymous: false,
    submittedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      wellnessSurvey: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      wellnessResponse: { findMany: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WellnessSurveyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WellnessSurveyService>(WellnessSurveyService);
  });

  describe('findAll', () => {
    it('should return all surveys', async () => {
      prisma.wellnessSurvey.findMany.mockResolvedValue([mockSurvey]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by companyId', async () => {
      prisma.wellnessSurvey.findMany.mockResolvedValue([mockSurvey]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a survey by id', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(mockSurvey);
      const result = await service.findById('survey-1');
      expect(result.id).toBe('survey-1');
    });

    it('should throw when not found', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCompany', () => {
    it('should return surveys for a company', async () => {
      prisma.wellnessSurvey.findMany.mockResolvedValue([mockSurvey]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findActive', () => {
    it('should return active surveys', async () => {
      prisma.wellnessSurvey.findMany.mockResolvedValue([mockSurvey]);
      const result = await service.findActive('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('toggleActive', () => {
    it('should toggle survey active state', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(mockSurvey);
      prisma.wellnessSurvey.update.mockResolvedValue({ ...mockSurvey, active: false });
      const result = await service.toggleActive('survey-1');
      expect(result.active).toBe(false);
    });

    it('should toggle from inactive to active', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue({ ...mockSurvey, active: false });
      prisma.wellnessSurvey.update.mockResolvedValue({ ...mockSurvey, active: true });
      const result = await service.toggleActive('survey-1');
      expect(result.active).toBe(true);
    });

    it('should throw when survey not found', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(null);
      await expect(service.toggleActive('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getResults', () => {
    it('should return survey results with averages', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(mockSurvey);
      prisma.wellnessResponse.findMany.mockResolvedValue([mockResponse]);
      const result = await service.getResults('survey-1');
      expect(result.surveyId).toBe('survey-1');
      expect(result.totalResponses).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].average).toBe(5);
    });

    it('should handle multiple responses', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(mockSurvey);
      prisma.wellnessResponse.findMany.mockResolvedValue([
        mockResponse,
        { ...mockResponse, id: 'resp-2', answers: { q1: 3 } },
      ]);
      const result = await service.getResults('survey-1');
      expect(result.totalResponses).toBe(2);
      expect(result.results[0].average).toBe(4);
    });
  });

  describe('create', () => {
    it('should create a survey successfully', async () => {
      prisma.wellnessSurvey.create.mockResolvedValue(mockSurvey);
      const result = await service.create({
        title: 'Employee Satisfaction',
        questions: [{ id: 'q1', label: 'How satisfied are you?', type: 'rating' }],
        companyId: 'comp-1',
      });
      expect(result).toEqual(mockSurvey);
    });

    it('should throw when title is empty', async () => {
      await expect(service.create({
        title: '', questions: [{ id: 'q1' }], companyId: 'comp-1',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when questions is empty', async () => {
      await expect(service.create({
        title: 'Survey', questions: [], companyId: 'comp-1',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when questions is not an array', async () => {
      await expect(service.create({
        title: 'Survey', questions: 'invalid', companyId: 'comp-1',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a survey', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(mockSurvey);
      prisma.wellnessSurvey.update.mockResolvedValue({ ...mockSurvey, title: 'Updated' });
      const result = await service.update('survey-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw when not found', async () => {
      prisma.wellnessSurvey.findUnique.mockResolvedValue(null);
      await expect(service.update('unknown', { title: 'x' })).rejects.toThrow(NotFoundException);
    });
  });
});
