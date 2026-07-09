import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityGuardService {
  constructor(private prisma: PrismaService) {}

  async assign(employeeId: string, companyId: string) {
    const existing = await this.prisma.securityGuard.findUnique({
      where: { employeeId_companyId: { employeeId, companyId } },
    });
    if (existing) throw new ConflictException('Employee is already a security guard');
    return this.prisma.securityGuard.create({
      data: { employeeId, companyId },
      include: { employee: true },
    });
  }

  async remove(id: string) {
    const guard = await this.prisma.securityGuard.findUnique({ where: { id } });
    if (!guard) throw new NotFoundException('Security guard not found');
    return this.prisma.securityGuard.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.securityGuard.findMany({
      where: { companyId, isActive: true },
      include: { employee: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findByEmployee(employeeId: string, companyId: string) {
    return this.prisma.securityGuard.findUnique({
      where: { employeeId_companyId: { employeeId, companyId } },
    });
  }

  async scanAttendance(guardId: string, employeeId: string) {
    const guard = await this.prisma.securityGuard.findUnique({ where: { id: guardId } });
    if (!guard || !guard.isActive) throw new NotFoundException('Security guard not found or inactive');
    return this.prisma.attendance.create({
      data: {
        employeeId,
        verifiedById: guardId,
        clockIn: new Date(),
      },
      include: {
        employee: true,
        verifiedBy: { include: { employee: true } },
      },
    });
  }
}
