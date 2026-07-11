import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxDeclarationService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.taxDeclaration.findMany({
      where: { companyId },
      orderBy: { year: 'desc' },
    });
  }

  async findById(id: string) {
    const decl = await this.prisma.taxDeclaration.findUnique({ where: { id } });
    if (!decl) throw new NotFoundException('Tax declaration not found');
    return decl;
  }

  async findByYear(companyId: string, year: number) {
    return this.prisma.taxDeclaration.findMany({
      where: { companyId, year },
      orderBy: { declarationDate: 'desc' },
    });
  }

  async findByType(companyId: string, taxType: string) {
    return this.prisma.taxDeclaration.findMany({
      where: { companyId, taxType },
      orderBy: { year: 'desc' },
    });
  }

  async create(data: {
    companyId: string;
    employeeId: string;
    year: number;
    taxType: string;
    taxableIncome: number;
    taxWithheld: number;
    declarationDate?: Date;
    dueDate: Date;
    status?: string;
    notes?: string;
  }) {
    const currentYear = new Date().getFullYear();
    if (data.year > currentYear || data.year < currentYear - 1) {
      throw new BadRequestException('Year must be the current year or previous year');
    }
    const declDate = data.declarationDate ? new Date(data.declarationDate) : new Date();
    const due = new Date(data.dueDate);
    if (due <= declDate) {
      throw new BadRequestException('Due date must be after declaration date');
    }
    return this.prisma.taxDeclaration.create({
      data: {
        ...data,
        declarationDate: declDate,
        status: data.status || 'draft',
      },
    });
  }

  async submit(id: string) {
    const decl = await this.findById(id);
    if (decl.status !== 'draft')
      throw new BadRequestException('Only draft declarations can be submitted');
    return this.prisma.taxDeclaration.update({ where: { id }, data: { status: 'submitted' } });
  }

  async confirmAmount(id: string, amount: number) {
    const decl = await this.findById(id);
    return this.prisma.taxDeclaration.update({ where: { id }, data: { confirmedAmount: amount } });
  }

  async markPaid(id: string) {
    const decl = await this.findById(id);
    if (decl.status !== 'submitted')
      throw new BadRequestException('Only submitted declarations can be marked paid');
    return this.prisma.taxDeclaration.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    });
  }

  async calculateWithholding(employeeId: string, year: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');
    const salary = employee.salary || 0;
    const annualSalary = salary * 12;
    let estimatedTax: number;
    if (annualSalary <= 10000) {
      estimatedTax = 0;
    } else if (annualSalary <= 25000) {
      estimatedTax = (annualSalary - 10000) * 0.11;
    } else if (annualSalary <= 50000) {
      estimatedTax = 1500 + (annualSalary - 25000) * 0.3;
    } else {
      estimatedTax = 9000 + (annualSalary - 50000) * 0.45;
    }
    return { employeeId, year, annualSalary, estimatedTax };
  }
}
