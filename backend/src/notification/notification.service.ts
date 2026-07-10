import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    return this.prisma.notification.findMany({
      ...(userId ? { where: { userId } } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { userId: string; title: string; message: string; type: string }) {
    const validTypes = ['invitation', 'payment', 'leave', 'attendance', 'payslip', 'recruitment', 'objective', 'review', 'contract', 'document'];
    if (!validTypes.includes(data.type)) {
      throw new BadRequestException(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
    return this.prisma.notification.create({ data });
  }

  async markRead(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async delete(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.delete({ where: { id } });
  }
}
