import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  async logAccess(actorId: string, targetUserId: string, action: string) {
    return this.prisma.gdprAccessLog.create({
      data: { actorId, targetUserId, action },
    });
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { members: { include: { company: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const employees = await this.prisma.employee.findMany({
      where: { userId },
      include: {
        leaves: true,
        payslips: {
          select: {
            id: true,
            month: true,
            year: true,
            netSalary: true,
            grossSalary: true,
            createdAt: true,
          },
        },
        documents: {
          select: { id: true, name: true, type: true, url: true, createdAt: true },
        },
        performanceReviews: {
          select: { id: true, rating: true, reviewDate: true, status: true },
        },
      },
    });

    const { password, ...safeUser } = user;

    return {
      exportedAt: new Date().toISOString(),
      user: safeUser,
      employees,
    };
  }

  async eraseOwnAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid user session');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Password is invalid');
    }

    await this.prisma.$transaction([
      this.prisma.employee.updateMany({
        where: { userId },
        data: { userId: null },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      }),
    ]);

    await this.logAccess(userId, userId, 'ERASE_OWN_ACCOUNT');
    return { success: true };
  }

  async eraseUserAsAdmin(adminId: string, targetUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction([
      this.prisma.employee.updateMany({
        where: { userId: targetUserId },
        data: { userId: null },
      }),
      this.prisma.user.update({
        where: { id: targetUserId },
        data: { deletedAt: new Date() },
      }),
    ]);

    await this.logAccess(adminId, targetUserId, 'ADMIN_ERASE_USER');
    return { success: true };
  }

  async purgeExpired() {
    const retentionDays = Number(process.env.DATA_RETENTION_DAYS || 1095);
    const cutoff = new Date(Date.now() - retentionDays * 86400000);

    const expired = await this.prisma.user.findMany({
      where: { deletedAt: { lt: cutoff } },
      select: { id: true },
    });
    const ids = expired.map((u) => u.id);

    if (ids.length) {
      await this.prisma.employee.deleteMany({ where: { userId: { in: ids } } });
      await this.prisma.user.deleteMany({ where: { id: { in: ids } } });
    }

    const purgedLogs = await this.prisma.gdprAccessLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    return { purgedUsers: ids.length, purgedLogs: purgedLogs.count };
  }
}
