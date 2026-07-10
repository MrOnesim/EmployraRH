import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitationService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, companyId: string, role?: string) {
    const token = crypto.randomBytes(32).toString('hex');
    return this.prisma.invitation.create({
      data: { email, companyId, token, role: role as any || 'EMPLOYEE' },
    });
  }

  async accept(id: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'pending') throw new BadRequestException('Invitation already processed');

    const user = await this.prisma.user.findUnique({ where: { email: invitation.email } });
    if (!user) throw new BadRequestException('User not found. Please sign up first.');

    await this.prisma.member.create({
      data: {
        userId: user.id,
        companyId: invitation.companyId,
        role: invitation.role,
      },
    });

    return this.prisma.invitation.update({
      where: { id },
      data: { status: 'accepted' },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.invitation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
