import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WellnessSurveyService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.wellnessSurvey.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const survey = await this.prisma.wellnessSurvey.findUnique({ where: { id }, include: { _count: { select: { responses: true } } } });
    if (!survey) throw new NotFoundException(`Wellness survey with id "${id}" not found`);
    return survey;
  }

  async findByCompany(companyId: string) {
    return this.prisma.wellnessSurvey.findMany({
      where: { companyId },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(companyId: string) {
    return this.prisma.wellnessSurvey.findMany({
      where: { companyId, active: true, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleActive(id: string) {
    const survey = await this.findById(id);
    return this.prisma.wellnessSurvey.update({
      where: { id },
      data: { active: !survey.active },
    });
  }

  async getResults(surveyId: string) {
    const survey = await this.findById(surveyId);
    const responses = await this.prisma.wellnessResponse.findMany({ where: { surveyId } });

    const questions = survey.questions as any[];
    const results: any[] = [];

    for (const question of questions) {
      const answers = responses.map(r => {
        const ans = r.answers as Record<string, any>;
        return ans[question.id || question.label || question.question] ?? ans[questions.indexOf(question)];
      }).filter(a => a !== undefined);

      const numericAnswers = answers.filter(a => typeof a === 'number');
      const result: any = {
        question: question.label || question.question || `Question ${questions.indexOf(question) + 1}`,
        total: answers.length,
      };

      if (numericAnswers.length > 0) {
        result.average = numericAnswers.reduce((s, v) => s + v, 0) / numericAnswers.length;
        result.min = Math.min(...numericAnswers);
        result.max = Math.max(...numericAnswers);
      }

      const distribution: Record<string, number> = {};
      for (const answer of answers) {
        const key = String(answer);
        distribution[key] = (distribution[key] || 0) + 1;
      }
      result.distribution = distribution;

      results.push(result);
    }

    return { surveyId: survey.id, title: survey.title, totalResponses: responses.length, results };
  }

  async create(data: { title: string; description?: string; questions?: any; expiresAt?: Date; companyId: string }) {
    if (!data.title || !data.title.trim()) throw new BadRequestException('Title is required');
    const questions = data.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestException('Questions must be a non-empty JSON array');
    }
    return this.prisma.wellnessSurvey.create({
      data: { ...data, questions },
      include: { _count: { select: { responses: true } } },
    });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.wellnessSurvey.update({ where: { id }, data });
  }
}
