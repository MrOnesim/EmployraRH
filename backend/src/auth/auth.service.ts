import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    @Optional() private mailService: MailService,
  ) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: { email: string; name: string; password: string }) {
    const user = await this.prisma.user.create({ data });
    await this.notifyWelcome(user);
    return user;
  }

  private async notifyWelcome(user: { email: string; name: string }) {
    if (!this.mailService) return;
    try {
      const link = `${process.env.FRONTEND_URL || ''}/login`;
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Welcome to the Employee & Payroll platform',
        template: 'welcome',
        context: {
          name: user.name,
          link,
        },
      });
    } catch {
      return;
    }
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { members: { include: { company: true } } },
    });
  }

  async revokeAllUserSessions(userId: string) {
    await this.prisma.$transaction([
      this.prisma.session.deleteMany({ where: { userId } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid user session');
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Current password is invalid');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    });

    await this.revokeAllUserSessions(userId);
  }
}
