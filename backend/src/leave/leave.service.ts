import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Optional,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RoleEnum } from '@prisma/client';

const DEFAULT_ANNUAL_DAYS = 25;

const LEAVE_TYPES = ['annual', 'sick', 'personal', 'maternity', 'paternity'] as const;

const MANAGER_ROLES: RoleEnum[] = ['SUPER_ADMIN', 'ADMIN', 'RH', 'MANAGER', 'DEPARTMENT_HEAD'];

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    @Optional() private mailService: MailService,
    @Optional() @Inject(CACHE_MANAGER) private cache?: Cache,
  ) {}

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

  private async checkOverlap(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ) {
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

  private async validateLeaveInput(
    data: { employeeId: string; type: string; startDate: Date; endDate: Date },
    excludeId?: string,
  ) {
    if (!LEAVE_TYPES.includes(data.type as any)) {
      throw new BadRequestException(
        `Invalid leave type. Must be one of: ${LEAVE_TYPES.join(', ')}`,
      );
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
        throw new BadRequestException(
          `Insufficient annual leave balance. ${balance} days remaining, ${duration} days requested`,
        );
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
    const key = `leave:balance:${employeeId}`;
    if (this.cache) {
      const cached = await this.cache.get(key).catch(() => null);
      if (cached) return cached;
    }

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

    if (this.cache) await this.cache.set(key, balances).catch(() => {});
    return balances;
  }

  async create(data: {
    employeeId: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
  }) {
    await this.validateLeaveInput(data);
    const leave = await this.prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: 'pending',
      },
    });
    await this.bustLeaveCaches(data.employeeId);
    await this.notifyLeaveRequested(leave);
    return leave;
  }

  async findAll(companyId: string) {
    const key = `leave:list:${companyId}`;
    if (this.cache) {
      const cached = await this.cache.get(key).catch(() => null);
      if (cached) return cached;
    }
    const data = await this.prisma.leave.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
    });
    if (this.cache) await this.cache.set(key, data).catch(() => {});
    return data;
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
    const key = `leave:hist:${employeeId}`;
    if (this.cache) {
      const cached = await this.cache.get(key).catch(() => null);
      if (cached) return cached;
    }
    const data = await this.prisma.leave.findMany({
      where: { employeeId },
      include: { employee: true },
    });
    if (this.cache) await this.cache.set(key, data).catch(() => {});
    return data;
  }

  async approve(id: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'pending') {
      throw new BadRequestException('Only pending leaves can be approved');
    }
    const updated = await this.prisma.leave.update({
      where: { id },
      data: { status: 'approved' },
    });
    await this.bustLeaveCaches(leave.employeeId);
    await this.notifyLeaveDecision(updated, true);
    return updated;
  }

  async reject(id: string, comment: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'pending') {
      throw new BadRequestException('Only pending leaves can be rejected');
    }
    const updated = await this.prisma.leave.update({
      where: { id },
      data: { status: 'rejected', comment },
    });
    await this.bustLeaveCaches(leave.employeeId);
    await this.notifyLeaveDecision(updated, false);
    return updated;
  }

  async update(id: string, data: { status?: string; comment?: string }) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'pending') {
      throw new BadRequestException('Only pending leaves can be updated');
    }
    const updated = await this.prisma.leave.update({ where: { id }, data });
    await this.bustLeaveCaches(leave.employeeId);
    return updated;
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private async notifyLeaveRequested(leave: any) {
    if (!this.mailService) return;
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { id: leave.employeeId },
        include: { company: true },
      });
      if (!employee) return;
      const managers = (await this.prisma.member.findMany({
        where: { companyId: employee.companyId, role: { in: MANAGER_ROLES } },
        include: { user: true },
      })) as any[];
      const link = `${process.env.FRONTEND_URL || ''}/leaves/${leave.id}`;
      for (const manager of managers) {
        if (manager.user?.email) {
          await this.mailService.sendMail({
            to: manager.user.email,
            subject: `New leave request from ${employee.firstName} ${employee.lastName}`,
            template: 'leave-requested',
            context: {
              employeeName: `${employee.firstName} ${employee.lastName}`,
              type: leave.type,
              startDate: this.formatDate(leave.startDate),
              endDate: this.formatDate(leave.endDate),
              reason: leave.reason || '',
              link,
            },
          });
        }
      }
    } catch {
      return;
    }
  }

  private async notifyLeaveDecision(leave: any, approved: boolean) {
    if (!this.mailService) return;
    try {
      const employee = await this.prisma.employee.findUnique({ where: { id: leave.employeeId } });
      if (!employee?.email) return;
      const link = `${process.env.FRONTEND_URL || ''}/leaves/${leave.id}`;
      await this.mailService.sendMail({
        to: employee.email,
        subject: `Your leave request has been ${approved ? 'approved' : 'rejected'}`,
        template: 'leave-decision',
        context: {
          employeeName: `${employee.firstName} ${employee.lastName}`,
          status: approved ? 'approved' : 'rejected',
          reason: leave.comment || '',
          link,
        },
      });
    } catch {
      return;
    }
  }

  private async bustLeaveCaches(employeeId: string) {
    if (!this.cache) return;
    await this.cache.del(`leave:balance:${employeeId}`).catch(() => {});
    await this.cache.del(`leave:hist:${employeeId}`).catch(() => {});
  }
}
