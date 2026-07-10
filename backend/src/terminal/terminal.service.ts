import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TerminalService {
  constructor(private prisma: PrismaService) {}

  async register(companyId: string, data: { name: string; deviceFingerprint: string }) {
    const existing = await this.prisma.terminal.findUnique({
      where: { deviceFingerprint: data.deviceFingerprint },
    });
    if (existing) throw new ConflictException('Terminal already registered with this device fingerprint');
    const apiKey = crypto.randomBytes(32).toString('hex');
    return this.prisma.terminal.create({
      data: {
        name: data.name,
        deviceFingerprint: data.deviceFingerprint,
        apiKey,
        companyId,
      },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.terminal.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const terminal = await this.prisma.terminal.findUnique({ where: { id } });
    if (!terminal) throw new NotFoundException('Terminal not found');
    return terminal;
  }

  async activate(id: string) {
    const terminal = await this.prisma.terminal.findUnique({ where: { id } });
    if (!terminal) throw new NotFoundException('Terminal not found');
    return this.prisma.terminal.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    const terminal = await this.prisma.terminal.findUnique({ where: { id } });
    if (!terminal) throw new NotFoundException('Terminal not found');
    return this.prisma.terminal.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateLastSeen(id: string) {
    const terminal = await this.prisma.terminal.findUnique({ where: { id } });
    if (!terminal) throw new NotFoundException('Terminal not found');
    return this.prisma.terminal.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  async getByFingerprint(deviceFingerprint: string) {
    const terminal = await this.prisma.terminal.findUnique({
      where: { deviceFingerprint },
    });
    if (!terminal) throw new NotFoundException('Terminal not found');
    return terminal;
  }
}
