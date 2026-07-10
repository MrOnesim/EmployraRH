import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayslipService {
  constructor(private prisma: PrismaService) {}

  async generate(employeeId: string, month: number, year: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const existing = await this.prisma.payslip.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
    });
    if (existing) throw new ConflictException('Payslip already exists for this employee, month, and year');

    const config = await this.prisma.payrollConfig.findUnique({
      where: { companyId: employee.companyId },
    });

    if (!config) throw new NotFoundException('Payroll config not found for employee company');

    const grossSalary = employee.salary ?? 0;
    const netSalary = grossSalary * (1 - config.taxRate - config.socialChargesRate);

    if (netSalary < 0) throw new BadRequestException('Net salary cannot be negative; check tax/social rates');

    return this.prisma.payslip.create({
      data: { employeeId, month, year, grossSalary, netSalary },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.payslip.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.payslip.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByEmployeeAndPeriod(employeeId: string, month: number, year: number) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
      include: { employee: true },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');
    return payslip;
  }

  async findById(id: string) {
    const payslip = await this.prisma.payslip.findUnique({ where: { id }, include: { employee: true } });
    if (!payslip) throw new NotFoundException('Payslip not found');
    return payslip;
  }
}
