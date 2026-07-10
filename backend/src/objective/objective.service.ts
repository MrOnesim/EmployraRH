import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObjectiveService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.objective.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  async findByCompany(companyId: string) {
    return this.prisma.objective.findMany({
      where: { employee: { companyId } },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(companyId: string, category: string) {
    return this.prisma.objective.findMany({
      where: { employee: { companyId }, category },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(companyId: string, status: string) {
    return this.prisma.objective.findMany({
      where: { employee: { companyId }, status },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const objective = await this.prisma.objective.findUnique({
      where: { id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!objective) throw new NotFoundException(`Objective with id "${id}" not found`);
    return objective;
  }

  async create(data: { employeeId: string; title: string; description?: string; category: string; deadline?: Date }) {
    if (!data.title || !data.title.trim()) throw new BadRequestException('Title is required');
    if (!data.category || !data.category.trim()) throw new BadRequestException('Category is required');
    if (data.deadline) {
      const deadline = new Date(data.deadline);
      if (deadline <= new Date()) throw new BadRequestException('Deadline must be a future date');
    }
    return this.prisma.objective.create({ data: { ...data, status: 'pending' } });
  }

  async updateStatus(id: string, status: string) {
    const objective = await this.findById(id);
    const validTransitions: Record<string, string[]> = {
      pending: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    const allowed = validTransitions[objective.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from "${objective.status}" to "${status}"`);
    }
    return this.prisma.objective.update({ where: { id }, data: { status } });
  }

  async update(id: string, data: { title?: string; description?: string; category?: string; deadline?: Date; status?: string }) {
    const objective = await this.findById(id);
    if (objective.status !== 'pending' && objective.status !== 'in_progress') {
      throw new BadRequestException(`Cannot edit objective with status "${objective.status}"`);
    }
    if (data.deadline) {
      const deadline = new Date(data.deadline);
      if (deadline <= new Date()) throw new BadRequestException('Deadline must be a future date');
    }
    return this.prisma.objective.update({ where: { id }, data });
  }
}
