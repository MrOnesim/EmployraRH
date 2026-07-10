import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrTokenService {
  private readonly secret: string;
  private readonly tokenDurationMs = 45_000;

  constructor(private prisma: PrismaService) {
    this.secret = process.env.QR_SECRET || 'employrarh-qr-secret-dev';
  }

  private generateToken(employeeId: string, companyId: string): string {
    const payload = `${employeeId}.${companyId}.${Date.now()}`;
    const signature = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    return `${payload}.${signature}`;
  }

  async generateForEmployee(employeeId: string, companyId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const token = this.generateToken(employeeId, companyId);
    const expiresAt = new Date(Date.now() + this.tokenDurationMs);

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { qrToken: token, qrTokenExpiresAt: expiresAt },
    });

    return { token, expiresInMs: this.tokenDurationMs };
  }

  async refreshToken(employeeId: string, companyId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const token = this.generateToken(employeeId, companyId);
    const expiresAt = new Date(Date.now() + this.tokenDurationMs);

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { qrToken: token, qrTokenExpiresAt: expiresAt },
    });

    return { token, expiresInMs: this.tokenDurationMs };
  }

  async findByEmployee(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { qrToken: true, qrTokenExpiresAt: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    if (!employee.qrToken || !employee.qrTokenExpiresAt) {
      throw new NotFoundException('No active QR token found for this employee');
    }

    if (new Date() > employee.qrTokenExpiresAt) {
      throw new NotFoundException('QR token has expired');
    }

    return { token: employee.qrToken, expiresAt: employee.qrTokenExpiresAt };
  }

  async validateToken(token: string) {
    const parts = token.split('.');
    if (parts.length < 4) return { employeeId: '', companyId: '', valid: false, reason: 'Invalid token format' };

    const timestamp = parseInt(parts[2], 10);
    const employeeId = parts[0];
    const companyId = parts[1];
    const signature = parts.slice(3).join('.');

    const payload = `${employeeId}.${companyId}.${timestamp}`;
    const expected = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');

    if (signature !== expected) return { employeeId, companyId, valid: false, reason: 'Invalid token signature' };

    const age = Date.now() - timestamp;
    if (age > this.tokenDurationMs) return { employeeId, companyId, valid: false, reason: 'Token expired' };

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.companyId !== companyId) {
      return { employeeId, companyId, valid: false, reason: 'Employee not found in company' };
    }

    return { employeeId, companyId, valid: true };
  }
}
