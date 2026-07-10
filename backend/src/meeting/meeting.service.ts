import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    date: string | Date;
    duration: number;
    link?: string;
    location?: string;
    companyId: string;
    participants?: { name?: string; email?: string; employeeId?: string }[];
  }) {
    if (!data.title || data.title.trim().length === 0) {
      throw new BadRequestException('Title is required');
    }
    const meetingDate = new Date(data.date);
    if (isNaN(meetingDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    if (meetingDate <= new Date()) {
      throw new BadRequestException('Meeting date must be in the future');
    }
    if (!data.duration || data.duration <= 0) {
      throw new BadRequestException('Duration must be greater than 0');
    }
    const { participants, ...meetingData } = data;
    return this.prisma.meeting.create({
      data: {
        ...meetingData,
        date: meetingDate,
        duration: data.duration,
        participants: participants && participants.length > 0
          ? { create: participants }
          : undefined,
      },
      include: { participants: true, _count: { select: { participants: true } } },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.meeting.findMany({
      where: { companyId },
      include: { _count: { select: { participants: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async findById(id: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async update(id: string, data: Partial<{ title: string; description: string; date: string | Date; duration: number; link: string; location: string }>) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.date <= new Date()) {
      throw new BadRequestException('Only upcoming meetings can be updated');
    }
    if (data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      throw new BadRequestException('Title cannot be empty');
    }
    if (data.date !== undefined) {
      const newDate = new Date(data.date);
      if (isNaN(newDate.getTime())) throw new BadRequestException('Invalid date');
      if (newDate <= new Date()) throw new BadRequestException('Meeting date must be in the future');
      data.date = newDate;
    }
    if (data.duration !== undefined && data.duration <= 0) {
      throw new BadRequestException('Duration must be greater than 0');
    }
    return this.prisma.meeting.update({
      where: { id },
      data,
      include: { participants: true },
    });
  }

  async delete(id: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.date <= new Date()) {
      throw new BadRequestException('Only upcoming meetings can be deleted');
    }
    return this.prisma.meeting.delete({ where: { id } });
  }

  async addParticipant(meetingId: string, data: { name?: string; email?: string; employeeId?: string }) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.prisma.meetingParticipant.create({
      data: { ...data, meetingId },
    });
  }

  async removeParticipant(meetingId: string, participantId: string) {
    const participant = await this.prisma.meetingParticipant.findUnique({ where: { id: participantId } });
    if (!participant) throw new NotFoundException('Participant not found');
    return this.prisma.meetingParticipant.delete({ where: { id: participantId } });
  }
}
