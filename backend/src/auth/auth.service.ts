import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: { email: string; name: string; password: string }) {
    return this.prisma.user.create({ data });
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
