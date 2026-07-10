import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_ANNUAL_DAYS = 25;

const LEAVE_TYPES = ['annual', 'sick', 'personal', 'maternity', 'paternity'] as const;

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  private async calculateBusinessDays(startDate: Date, endDate: Date): Promise<number> {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  private async checkOverlap(employeeId: string, startDate: Date, endDate: Date, excludeId?: string) {
    const where: any = {
      employeeId,
      status: { in: ['pending', 'approved'] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    };
    if (excludeId) where.id = { not: excludeId };
    const existing = await this.prisma.leave.findFirst({ where });
    if (existing) {
      throw new ConflictException('Employee already has a leave in this date range');
    }
  }

  private async validateLeaveInput(data: { employeeId: string; type: string; startDate: Date; endDate: Date }, excludeId?: string) {
    if (!LEAVE_TYPES.includes(data.type as any)) {
      throw new BadRequestException(`Invalid leave type. Must be one of: ${LEAVE_TYPES.join(', ')}`);
    }

    if (data.startDate >= data.endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(data.startDate);
    start.setHours(0, 0, 0, 0);
    if (start < today) {
      throw new BadRequestException('startDate must be today or a future date');
    }

    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.checkOverlap(data.employeeId, data.startDate, data.endDate, excludeId);

    if (data.type === 'annual') {
      const balance = await this.getRemainingAnnualDays(data.employeeId);
      const duration = await this.calculateBusinessDays(data.startDate, data.endDate);
      if (duration > balance) {
        throw new BadRequestException(`Insufficient annual leave balance. ${balance} days remaining, ${duration} days requested`);
      }
    }
  }

  async getRemainingAnnualDays(employeeId: string): Promise<number> {
    const leaves = await this.prisma.leave.findMany({
      where: { employeeId, type: 'annual', status: { in: ['pending', 'approved'] } },
    });
    let usedDays = 0;
    for (const leave of leaves) {
      usedDays += await this.calculateBusinessDays(leave.startDate, leave.endDate);
    }
    return DEFAULT_ANNUAL_DAYS - usedDays;
  }

  async getBalance(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const balances: Record<string, number | null> = {};
    for (const type of LEAVE_TYPES) {
      if (type === 'annual') {
        balances[type] = await this.getRemainingAnnualDays(employeeId);
      } else {
        balances[type] = null;
      }
    }
    return balances;
  }

  async create(data: { employeeId: string; type: string; startDate: Date; endDate: Date; reason?: string }) {
    await this.validateLeaveInput(data);
    return this.prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: 'pending',
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.leave.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
    });
  }

  async findById(id: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.leave.findMany({
      where: { employeeId },
      include: { employee: true },
    });
  }

  async approve(id: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'pending') {
      throw new BadRequestException('Only pending leaves can be approved');
    }
    return this.prisma.leave.update({
      where: { id },
      data: { status: 'approved' },
    });
  }

  async reject(id: string, comment: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'pending') {
      throw new BadRequestException('Only pending leaves can be rejected');
    }
    return this.prisma.leave.update({
      where: { id },
      data: { status: 'rejected', comment },
    });
  }

  async update(id: string, data: { status?: string; comment?: string }) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'pending') {
      throw new BadRequestException('Only pending leaves can be updated');
    }
    return this.prisma.leave.update({ where: { id }, data });
  }
}
