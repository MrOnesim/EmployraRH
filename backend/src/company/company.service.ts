import { Injectable, Optional, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { RoleEnum } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(CACHE_MANAGER) private cache?: Cache,
  ) {}

  async create(data: { name: string; slug: string; currency?: string; country?: string }) {
    return this.prisma.company.create({ data });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: { _count: { select: { members: true, employees: true } } },
    });
  }

  async findById(id: string) {
    const key = `company:${id}`;
    if (this.cache) {
      const cached = await this.cache.get(key).catch(() => null);
      if (cached) return cached;
    }
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
    if (this.cache) await this.cache.set(key, company).catch(() => {});
    return company;
  }

  async addMember(companyId: string, userId: string, role: RoleEnum = 'EMPLOYEE') {
    const created = await this.prisma.member.create({ data: { companyId, userId, role } });
    if (this.cache) await this.cache.del(`company:${companyId}`).catch(() => {});
    return created;
  }
}
