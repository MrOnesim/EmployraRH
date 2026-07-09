import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WellnessResponseService {
  constructor(private prisma: PrismaService) {}

  async findBySurvey(surveyId: string) {
    return this.prisma.wellnessResponse.findMany({ where: { surveyId } });
  }

  async findById(id: string) {
    return this.prisma.wellnessResponse.findUnique({ where: { id } });
  }

  async create(data: { surveyId: string; employeeId: string; answers?: any; anonymous?: boolean }) {
    return this.prisma.wellnessResponse.create({
      data: { ...data, answers: data.answers || {}, anonymous: data.anonymous || false },
    });
  }
}
