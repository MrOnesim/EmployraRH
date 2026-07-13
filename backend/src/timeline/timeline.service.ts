import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.timelineEvent.findMany({ where: { employeeId }, orderBy: { date: 'desc' } });
  }

  async findByCompany(companyId: string) {
    return this.prisma.timelineEvent.findMany({
      where: { employee: { companyId } },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: {
    employeeId: string;
    type: string;
    title: string;
    description?: string;
    date?: string;
  }) {
    if (!data.title || !data.title.trim()) throw new BadRequestException('Title is required');
    if (!data.type || !data.type.trim()) throw new BadRequestException('Type is required');
    return this.prisma.timelineEvent.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        title: data.title,
        description: data.description ?? '',
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }
}
