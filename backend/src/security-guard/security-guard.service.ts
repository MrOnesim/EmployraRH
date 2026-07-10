import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityGuardService {
  constructor(private prisma: PrismaService) {}

  async assign(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const existing = await this.prisma.securityGuard.findUnique({
      where: { employeeId_companyId: { employeeId, companyId } },
    });
    if (existing) throw new ConflictException('Employee is already a security guard in this company');

    return this.prisma.securityGuard.create({
      data: { employeeId, companyId, isActive: true },
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

  async toggleActive(id: string) {
    const guard = await this.prisma.securityGuard.findUnique({ where: { id } });
    if (!guard) throw new NotFoundException('Security guard not found');
    return this.prisma.securityGuard.update({
      where: { id },
      data: { isActive: !guard.isActive },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.securityGuard.findMany({
      where: { companyId },
      include: { employee: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findByEmployee(employeeId: string, companyId: string) {
    return this.prisma.securityGuard.findUnique({
      where: { employeeId_companyId: { employeeId, companyId } },
    });
  }

  async getScanHistory(guardId: string) {
    const guard = await this.prisma.securityGuard.findUnique({ where: { id: guardId } });
    if (!guard) throw new NotFoundException('Security guard not found');
    return this.prisma.attendance.findMany({
      where: { verifiedById: guardId },
      include: { employee: true },
      orderBy: { clockIn: 'desc' },
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
