import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseReportDto } from './dto/create-expense-report.dto';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';
import { ReceiptExpenseDto } from './dto/receipt-expense.dto';

@Injectable()
export class ExpenseReportService {
  private readonly validTransitions: Record<string, string[]> = {
    pending: ['approved', 'rejected'],
    approved: [],
    rejected: [],
  };

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenseReportDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    return this.prisma.expenseReport.create({ data: dto });
  }

  async findAll(companyId?: string) {
    return this.prisma.expenseReport.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const expense = await this.prisma.expenseReport.findUnique({
      where: { id },
    });
    if (!expense) {
      throw new NotFoundException(`Expense report with id "${id}" not found`);
    }
    return expense;
  }

  async findByCompany(companyId: string) {
    return this.prisma.expenseReport.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.expenseReport.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByMission(missionId: string) {
    return this.prisma.expenseReport.findMany({
      where: { missionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, dto: ApproveExpenseDto) {
    const expense = await this.findById(id);
    this.validateTransition(expense.status, 'approved');

    return this.prisma.expenseReport.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: dto.approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async reject(id: string, dto: RejectExpenseDto) {
    const expense = await this.findById(id);
    this.validateTransition(expense.status, 'rejected');

    return this.prisma.expenseReport.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: dto.reason,
      },
    });
  }

  async uploadReceipt(id: string, dto: ReceiptExpenseDto) {
    await this.findById(id);

    return this.prisma.expenseReport.update({
      where: { id },
      data: { receiptUrl: dto.url },
    });
  }

  private validateTransition(current: string, target: string) {
    const allowed = this.validTransitions[current];
    if (!allowed || !allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot transition expense report from "${current}" to "${target}"`,
      );
    }
  }
}
