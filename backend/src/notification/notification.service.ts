import { Injectable } from '@nestjs/common';
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

  async findById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async create(data: { userId: string; title: string; message: string; type: string }) {
    return this.prisma.notification.create({ data });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
