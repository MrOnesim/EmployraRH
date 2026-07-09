import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarEventService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.calendarEvent.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { date: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.calendarEvent.findUnique({ where: { id } });
  }

  async create(data: { title: string; description?: string; date: Date; time?: string; location?: string; type: string; companyId: string }) {
    return this.prisma.calendarEvent.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
