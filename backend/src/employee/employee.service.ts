import { Injectable, NotFoundException, Optional, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Employee } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(CACHE_MANAGER) private cache?: Cache,
  ) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
    department?: string;
    salary?: number;
    companyId: string;
    userId?: string;
  }) {
    return this.prisma.employee.create({ data });
  }

  async findAll(companyId: string) {
    const key = `emp:list:${companyId}`;
    if (this.cache) {
      const cached = await this.cache.get(key).catch(() => null);
      if (cached) return cached;
    }
    const data = await this.prisma.employee.findMany({ where: { companyId } });
    if (this.cache) await this.cache.set(key, data).catch(() => {});
    return data;
  }

  async findById(id: string) {
    const key = `emp:${id}`;
    if (this.cache) {
      const cached = await this.cache.get<Employee>(key).catch(() => null);
      if (cached) return cached;
    }
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    if (this.cache) await this.cache.set(key, employee).catch(() => {});
    return employee;
  }

  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      position: string;
      department: string;
      salary: number;
    }>,
  ) {
    const existing = await this.findById(id);
    const updated = await this.prisma.employee.update({ where: { id }, data });
    await this.bustCaches(id, existing.companyId);
    return updated;
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    const result = await this.prisma.employee.delete({ where: { id } });
    await this.bustCaches(id, existing.companyId);
    return result;
  }

  private async bustCaches(id: string, companyId?: string) {
    if (!this.cache) return;
    await this.cache.del(`emp:${id}`).catch(() => {});
    if (companyId) await this.cache.del(`emp:list:${companyId}`).catch(() => {});
  }
}
