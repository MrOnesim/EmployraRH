import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async clockIn(employeeId: string) {
    return this.prisma.attendance.create({ data: { employeeId, clockIn: new Date() } });
  }

  async clockOut(id: string) {
    const record = await this.prisma.attendance.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Attendance record not found');
    return this.prisma.attendance.update({ where: { id }, data: { clockOut: new Date() } });
  }

  async startBreak(id: string) {
    const record = await this.prisma.attendance.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Attendance record not found');
    return this.prisma.attendance.update({ where: { id }, data: { breakStart: new Date() } });
  }

  async endBreak(id: string) {
    const record = await this.prisma.attendance.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Attendance record not found');
    return this.prisma.attendance.update({ where: { id }, data: { breakEnd: new Date() } });
  }

  async findAll(companyId: string) {
    return this.prisma.attendance.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: { clockIn: 'desc' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { clockIn: 'desc' },
    });
  }
}
