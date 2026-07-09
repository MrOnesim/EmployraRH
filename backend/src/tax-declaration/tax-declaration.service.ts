import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxDeclarationService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.taxDeclaration.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { dueDate: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.taxDeclaration.findUnique({ where: { id } });
  }

  async create(data: { companyId: string; employeeId: string; year: number; taxType: string; taxableIncome: number; taxWithheld: number; declarationDate?: Date; dueDate: Date; status?: string; notes?: string }) {
    return this.prisma.taxDeclaration.create({ data });
  }

  async update(id: string, data: { status?: string; confirmedAmount?: number; paidAt?: Date; notes?: string }) {
    return this.prisma.taxDeclaration.update({ where: { id }, data });
  }
}
