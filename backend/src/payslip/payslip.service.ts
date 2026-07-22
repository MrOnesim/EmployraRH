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
import { ComplianceService } from '../compliance/compliance.service';

@Injectable()
export class PayslipService {
  constructor(
    private prisma: PrismaService,
    private compliance: ComplianceService,
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

    const countryCode = employee.company?.country ?? 'FR';

    const { result } = await this.compliance.calculatePayslip(
      employeeId,
      month,
      year,
      employee.salary ?? 0,
      countryCode,
    );

    if (result.netPayable < 0)
      throw new BadRequestException('Net salary cannot be negative; check tax/social rates');

    const created = await this.prisma.payslip.create({
      data: {
        employeeId,
        month,
        year,
        grossSalary: result.grossSalary,
        netSalary: result.netPayable,
        totalContributions: result.totalEmployeeContributions,
        incomeTax: result.incomeTax,
        netSocial: result.netSocial,
        netPayable: result.netPayable,
        countryCode,
        complianceSnapshot: JSON.parse(JSON.stringify(result.metadata)),
      },
    });

    await this.bustCaches(employeeId, employee.companyId);
    return created;
  }

  async findByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where: { employee: { companyId } },
        include: { employee: true },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.payslip.count({ where: { employee: { companyId } } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByEmployee(employeeId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where: { employeeId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.payslip.count({ where: { employeeId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
