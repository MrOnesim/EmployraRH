import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarEventService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.calendarEvent.findMany({
      where: { companyId },
      orderBy: { date: 'asc' },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Calendar event not found');
    return event;
  }

  async findByDateRange(companyId: string, start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    return this.prisma.calendarEvent.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findByType(companyId: string, type: string) {
    const validTypes = ['meeting', 'birthday', 'holiday', 'team', 'training', 'other'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
    return this.prisma.calendarEvent.findMany({
      where: { companyId, type },
      orderBy: { date: 'asc' },
    });
  }

  async findUpcoming(companyId: string, limit?: number) {
    return this.prisma.calendarEvent.findMany({
      where: {
        companyId,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: limit || 10,
    });
  }

  async create(data: { title: string; description?: string; date: string | Date; time?: string; location?: string; type: string; allDay?: boolean; companyId: string }) {
    if (!data.title || data.title.trim().length === 0) {
      throw new BadRequestException('Title is required');
    }
    const eventDate = new Date(data.date);
    if (isNaN(eventDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    const validTypes = ['meeting', 'birthday', 'holiday', 'team', 'training', 'other'];
    if (!validTypes.includes(data.type)) {
      throw new BadRequestException(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
    return this.prisma.calendarEvent.create({
      data: { ...data, date: eventDate },
    });
  }

  async update(id: string, data: Partial<{ title: string; description: string; date: string | Date; time: string; location: string; type: string; allDay: boolean }>) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Calendar event not found');
    if (data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      throw new BadRequestException('Title cannot be empty');
    }
    if (data.type !== undefined) {
      const validTypes = ['meeting', 'birthday', 'holiday', 'team', 'training', 'other'];
      if (!validTypes.includes(data.type)) {
        throw new BadRequestException(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
      }
    }
    if (data.date !== undefined) {
      const newDate = new Date(data.date);
      if (isNaN(newDate.getTime())) throw new BadRequestException('Invalid date');
      data.date = newDate;
    }
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }

  async delete(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Calendar event not found');
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
