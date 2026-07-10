import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WellnessResponseService {
  constructor(private prisma: PrismaService) {}

  async findBySurvey(surveyId: string) {
    return this.prisma.wellnessResponse.findMany({ where: { surveyId }, orderBy: { submittedAt: 'desc' } });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.wellnessResponse.findMany({
      where: { employeeId },
      include: { survey: { select: { id: true, title: true } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.wellnessResponse.findMany({
      where: { survey: { companyId } },
      include: { survey: { select: { id: true, title: true } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const response = await this.prisma.wellnessResponse.findUnique({
      where: { id },
      include: { survey: { select: { id: true, title: true } } },
    });
    if (!response) throw new NotFoundException(`Wellness response with id "${id}" not found`);
    return response;
  }

  async submit(surveyId: string, employeeId: string, answers: any, anonymous?: boolean) {
    const survey = await this.prisma.wellnessSurvey.findUnique({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException(`Wellness survey with id "${surveyId}" not found`);
    if (!survey.active) throw new BadRequestException('Survey is not active');
    if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) throw new BadRequestException('Survey has expired');

    const existing = await this.prisma.wellnessResponse.findUnique({
      where: { employeeId_surveyId: { employeeId, surveyId } },
    });
    if (existing) throw new ConflictException('You have already submitted a response to this survey');

    return this.prisma.wellnessResponse.create({
      data: { surveyId, employeeId, answers, anonymous: anonymous || false },
    });
  }

  async create(data: { surveyId: string; employeeId: string; answers?: any; anonymous?: boolean }) {
    return this.prisma.wellnessResponse.create({
      data: { ...data, answers: data.answers || {}, anonymous: data.anonymous || false },
    });
  }
}
