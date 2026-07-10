import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrTokenService } from '../qr-token/qr-token.service';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private qrTokenService: QrTokenService,
  ) {}

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

  private cooldownMs = 30_000;
  private anomalyThresholdScans = 10;

  async scanWithGuard(params: {
    qrToken: string;
    guardId: string;
    terminalId: string;
    deviceFingerprint: string;
    ipAddress?: string;
    scanMethod?: string;
  }) {
    const guard = await this.prisma.securityGuard.findUnique({ where: { id: params.guardId } });
    if (!guard || !guard.isActive) throw new NotFoundException('Security guard not found or inactive');

    const terminal = await this.prisma.terminal.findUnique({ where: { id: params.terminalId } });
    if (!terminal || !terminal.isActive) throw new NotFoundException('Terminal not found or inactive');
    if (terminal.deviceFingerprint !== params.deviceFingerprint) {
      throw new ForbiddenException('Device fingerprint mismatch');
    }

    const tokenResult = await this.qrTokenService.validateToken(params.qrToken);
    if (!tokenResult.valid) throw new BadRequestException(tokenResult.reason);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const lastScan = await this.prisma.attendance.findFirst({
      where: {
        employeeId: tokenResult.employeeId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastScan && lastScan.verifiedById !== params.guardId) {
      const guardOther = await this.prisma.securityGuard.findUnique({ where: { id: lastScan.verifiedById! } });
      if (guardOther) {
        throw new BadRequestException(`Employee already scanned by another guard (${guardOther.employeeId})`);
      }
    }

    if (lastScan) {
      const timeSinceLast = Date.now() - lastScan.createdAt.getTime();
      if (timeSinceLast < this.cooldownMs) {
        const remaining = Math.ceil((this.cooldownMs - timeSinceLast) / 1000);
        throw new BadRequestException(`Cooldown active. Please wait ${remaining}s`);
      }
    }

    const recentScans = await this.prisma.attendance.count({
      where: {
        employeeId: tokenResult.employeeId,
        createdAt: { gte: todayStart },
      },
    });
    if (recentScans >= this.anomalyThresholdScans) {
      throw new BadRequestException('Anomaly detected: too many scans today');
    }

    const latestStatus = lastScan?.status || null;
    const now = new Date();
    let status = 'present';
    if (!lastScan || lastScan.clockOut) {
      status = 'present';
    } else if (lastScan.clockIn && !lastScan.clockOut) {
      const existingRecord = await this.prisma.attendance.update({
        where: { id: lastScan.id },
        data: { clockOut: now, status: 'present' },
      });
      return existingRecord;
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        employeeId: tokenResult.employeeId,
        verifiedById: params.guardId,
        terminalId: params.terminalId,
        deviceFingerprint: params.deviceFingerprint,
        ipAddress: params.ipAddress,
        scanMethod: params.scanMethod || 'qr',
        qrToken: params.qrToken,
        status,
        clockIn: now,
      },
      include: {
        employee: true,
        verifiedBy: { include: { employee: true } },
        terminal: true,
      },
    });

    await this.prisma.terminal.update({
      where: { id: params.terminalId },
      data: { lastSeenAt: now },
    });

    return attendance;
  }
}
