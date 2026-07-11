import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Optional,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayslipService {
  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(CACHE_MANAGER) private cache?: Cache,
  ) {}

  async generate(employeeId: string, month: number, year: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const existing = await this.prisma.payslip.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
    });
    if (existing)
      throw new ConflictException('Payslip already exists for this employee, month, and year');

    const config = await this.prisma.payrollConfig.findUnique({
      where: { companyId: employee.companyId },
    });

    if (!config) throw new NotFoundException('Payroll config not found for employee company');

    const grossSalary = employee.salary ?? 0;
    const netSalary = grossSalary * (1 - config.taxRate - config.socialChargesRate);

    if (netSalary < 0)
      throw new BadRequestException('Net salary cannot be negative; check tax/social rates');

    const created = await this.prisma.payslip.create({
      data: { employeeId, month, year, grossSalary, netSalary },
    });

    await this.bustCaches(employeeId, employee.companyId);
    return created;
  }

  async findByCompany(companyId: string) {
    const key = `payslip:company:${companyId}`;
    if (this.cache) {
      const cached = await this.cache.get(key).catch(() => null);
      if (cached) return cached;
    }
    const data = await this.prisma.payslip.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    if (this.cache) await this.cache.set(key, data).catch(() => {});
    return data;
  }

  async findByEmployee(employeeId: string) {
    const key = `payslip:hist:${employeeId}`;
    if (this.cache) {
      const cached = await this.cache.get(key).catch(() => null);
      if (cached) return cached;
    }
    const data = await this.prisma.payslip.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    if (this.cache) await this.cache.set(key, data).catch(() => {});
    return data;
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
    const payslip = await this.prisma.payslip.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');
    return payslip;
  }

  private async bustCaches(employeeId: string, companyId?: string) {
    if (!this.cache) return;
    await this.cache.del(`payslip:hist:${employeeId}`).catch(() => {});
    if (companyId) await this.cache.del(`payslip:company:${companyId}`).catch(() => {});
  }
}
