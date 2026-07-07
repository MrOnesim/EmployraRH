import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; description?: string; date: Date; duration: number; link?: string; location?: string; companyId: string }) {
    return this.prisma.meeting.create({ data: { ...data, participants: { create: [] } }, include: { participants: true } });
  }

  async findAll(companyId: string) {
    return this.prisma.meeting.findMany({ where: { companyId }, include: { participants: true }, orderBy: { date: 'desc' } });
  }

  async update(id: string, data: Partial<{ title: string; description: string; date: Date; duration: number; link: string; location: string }>) {
    return this.prisma.meeting.update({ where: { id }, data, include: { participants: true } });
  }

  async join(id: string, participant: { name?: string; email?: string; employeeId?: string }) {
    return this.prisma.meetingParticipant.create({ data: { ...participant, meetingId: id } });
  }

  async leave(id: string, participantId: string) {
    return this.prisma.meetingParticipant.delete({ where: { id: participantId } });
  }
}
