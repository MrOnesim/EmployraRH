import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TerminalService {
  constructor(private prisma: PrismaService) {}

  async register(name: string, deviceFingerprint: string, companyId: string) {
    const existing = await this.prisma.terminal.findUnique({
      where: { deviceFingerprint },
    });
    if (existing) throw new ConflictException('Terminal already registered with this device fingerprint');
    return this.prisma.terminal.create({
      data: { name, deviceFingerprint, companyId },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.terminal.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const terminal = await this.prisma.terminal.findUnique({ where: { id } });
    if (!terminal) throw new NotFoundException('Terminal not found');
    return terminal;
  }

  async deactivate(id: string) {
    const terminal = await this.prisma.terminal.findUnique({ where: { id } });
    if (!terminal) throw new NotFoundException('Terminal not found');
    return this.prisma.terminal.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
