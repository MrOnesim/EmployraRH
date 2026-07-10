import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalaryAdvanceService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.salaryAdvance.findMany({
      where: { employee: { companyId } },
      include: { employee: true },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.salaryAdvance.findMany({
      where: { employeeId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const advance = await this.prisma.salaryAdvance.findUnique({ where: { id } });
    if (!advance) throw new NotFoundException('Salary advance not found');
    return advance;
  }

  async create(data: { employeeId: string; amount: number; currency?: string; reason?: string }) {
    if (data.amount <= 0) throw new BadRequestException('Amount must be greater than 0');

    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    if (employee.salary && data.amount > employee.salary * 0.5) {
      throw new BadRequestException('Advance cannot exceed 50% of monthly salary');
    }

    const pendingCount = await this.prisma.salaryAdvance.count({
      where: { employeeId: data.employeeId, status: 'requested' },
    });
    if (pendingCount > 0) {
      throw new ConflictException('Employee already has a pending advance');
    }

    return this.prisma.salaryAdvance.create({
      data: {
        employeeId: data.employeeId,
        amount: data.amount,
        currency: data.currency || 'EUR',
        reason: data.reason,
      },
    });
  }

  async approve(id: string, approvedBy: string) {
    const advance = await this.findById(id);
    if (advance.status !== 'requested') {
      throw new BadRequestException('Only requested advances can be approved');
    }
    return this.prisma.salaryAdvance.update({
      where: { id },
      data: { status: 'approved', approvedBy, approvedAt: new Date() },
    });
  }

  async reject(id: string) {
    const advance = await this.findById(id);
    if (advance.status !== 'requested') {
      throw new BadRequestException('Only requested advances can be rejected');
    }
    return this.prisma.salaryAdvance.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async markPaid(id: string) {
    const advance = await this.findById(id);
    if (advance.status !== 'approved') {
      throw new BadRequestException('Only approved advances can be marked as paid');
    }
    const repaymentDate = new Date();
    repaymentDate.setMonth(repaymentDate.getMonth() + 1);
    return this.prisma.salaryAdvance.update({
      where: { id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        repaymentDate,
        repaymentAmount: advance.amount,
      },
    });
  }

  async markRepaid(id: string) {
    const advance = await this.findById(id);
    if (advance.status !== 'paid') {
      throw new BadRequestException('Only paid advances can be marked as repaid');
    }
    if (advance.repaymentStatus !== 'pending') {
      throw new BadRequestException('Advance repayment is not pending');
    }
    return this.prisma.salaryAdvance.update({
      where: { id },
      data: { repaymentStatus: 'repaid' },
    });
  }
}
