import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleEnum } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string; currency?: string; country?: string }) {
    return this.prisma.company.create({ data });
  }

  async findAll() {
    return this.prisma.company.findMany({ include: { _count: { select: { members: true, employees: true } } } });
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({ where: { id }, include: { members: { include: { user: true } } } });
  }

  async addMember(companyId: string, userId: string, role: RoleEnum = 'EMPLOYEE') {
    return this.prisma.member.create({ data: { companyId, userId, role } });
  }
}
