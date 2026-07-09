import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObjectiveService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.objective.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.objective.findUnique({ where: { id } });
  }

  async create(data: { employeeId: string; title: string; description?: string; category: string; deadline?: Date }) {
    return this.prisma.objective.create({ data });
  }

  async update(id: string, data: { status?: string }) {
    return this.prisma.objective.update({ where: { id }, data });
  }
}
