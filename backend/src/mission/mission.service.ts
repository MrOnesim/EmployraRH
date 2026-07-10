import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { CompleteMissionDto } from './dto/complete-mission.dto';
import { SubmitExpenseDto } from './dto/submit-expense.dto';

@Injectable()
export class MissionService {
  private readonly validTransitions: Record<string, string[]> = {
    pending: ['approved', 'rejected'],
    approved: ['completed'],
    rejected: [],
    completed: [],
  };

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMissionDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate < now) {
      throw new BadRequestException('Start date must be today or in the future');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (dto.budget !== undefined && dto.budget <= 0) {
      throw new BadRequestException('Budget must be positive');
    }

    return this.prisma.mission.create({
      data: {
        ...dto,
        startDate,
        endDate,
        status: 'pending',
      },
    });
  }

  async findAll(companyId?: string) {
    return this.prisma.mission.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    const mission = await this.prisma.mission.findUnique({ where: { id } });
    if (!mission) {
      throw new NotFoundException(`Mission with id "${id}" not found`);
    }
    return mission;
  }

  async findByCompany(companyId: string) {
    return this.prisma.mission.findMany({
      where: { companyId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.mission.findMany({
      where: { employeeId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getExpenses(missionId: string) {
    await this.findById(missionId);
    return this.prisma.expenseReport.findMany({
      where: { missionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string) {
    const mission = await this.findById(id);
    this.validateTransition(mission.status, 'approved');

    return this.prisma.mission.update({
      where: { id },
      data: { status: 'approved' },
    });
  }

  async reject(id: string) {
    const mission = await this.findById(id);
    this.validateTransition(mission.status, 'rejected');

    return this.prisma.mission.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async complete(id: string, dto?: CompleteMissionDto) {
    const mission = await this.findById(id);
    this.validateTransition(mission.status, 'completed');

    return this.prisma.mission.update({
      where: { id },
      data: {
        status: 'completed',
        ...(dto?.report !== undefined ? { report: dto.report } : {}),
      },
    });
  }

  async submitExpense(missionId: string, dto: SubmitExpenseDto) {
    await this.findById(missionId);

    const expense = await this.prisma.expenseReport.findUnique({
      where: { id: dto.expenseReportId },
    });
    if (!expense) {
      throw new NotFoundException(
        `Expense report with id "${dto.expenseReportId}" not found`,
      );
    }

    return this.prisma.expenseReport.update({
      where: { id: dto.expenseReportId },
      data: { missionId },
    });
  }

  private validateTransition(current: string, target: string) {
    const allowed = this.validTransitions[current];
    if (!allowed || !allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot transition mission from "${current}" to "${target}"`,
      );
    }
  }
}
