import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.employee.findMany({ where: { companyId } });
  }

  async findById(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    salary: number;
  }>) {
    await this.findById(id);
    return this.prisma.employee.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.employee.delete({ where: { id } });
  }
}
