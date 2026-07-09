import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WellnessSurveyService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.wellnessSurvey.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.wellnessSurvey.findUnique({ where: { id } });
  }

  async create(data: { title: string; description?: string; questions?: any; expiresAt?: Date; companyId: string }) {
    return this.prisma.wellnessSurvey.create({
      data: { ...data, questions: data.questions || [] },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.wellnessSurvey.update({ where: { id }, data });
  }
}
