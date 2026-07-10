import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Rubric {
  label: string;
  type: 'earning' | 'deduction';
  base: number;
  rate: number;
  amount: number;
}

export interface GrossSalaryResult {
  amount: number;
  rubrics: Rubric[];
}

export interface OvertimeResult {
  totalHours: number;
  totalPay: number;
  rubrics: Rubric[];
}

export interface BonusResult {
  total: number;
  rubrics: Rubric[];
}

export interface SocialContributionsResult {
  total: number;
  breakdown: Rubric[];
}

export interface IncomeTaxResult {
  amount: number;
  rate: number;
  rubrics: Rubric[];
}

export interface NetPayableResult {
  amount: number;
}

export interface DetailedBulletin {
  grossSalary: number;
  totalContributions: number;
  incomeTax: number;
  netSocial: number;
  netPayable: number;
  overtimeHours: number;
  overtimePay: number;
  bonusTotal: number;
  rubrics: Rubric[];
}

@Injectable()
export class SalaryCalculatorService {
  constructor(private prisma: PrismaService) {}

  private STANDARD_DAILY_HOURS = 7;
  private STANDARD_MONTHLY_DAYS = 22;
  private SENIORITY_YEARS_THRESHOLD = 3;
  private SENIORITY_BONUS_RATE = 0.05;

  async calculateGrossSalary(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<GrossSalaryResult> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    const baseSalary = employee?.salary ?? 0;
    const rubrics: Rubric[] = [];

    rubrics.push({
      label: 'Salaire de base',
      type: 'earning',
      base: baseSalary,
      rate: 1,
      amount: baseSalary,
    });

    const thirteenthMonth = baseSalary / 12;
    rubrics.push({
      label: '13ème mois (pro-rata)',
      type: 'earning',
      base: baseSalary,
      rate: 1 / 12,
      amount: thirteenthMonth,
    });

    let seniorityBonus = 0;
    if (employee?.hireDate) {
      const now = new Date();
      const hireDate = new Date(employee.hireDate);
      const yearsDiff = now.getFullYear() - hireDate.getFullYear();
      if (yearsDiff >= this.SENIORITY_YEARS_THRESHOLD) {
        seniorityBonus = baseSalary * this.SENIORITY_BONUS_RATE;
        rubrics.push({
          label: 'Prime d\'ancienneté',
          type: 'earning',
          base: baseSalary,
          rate: this.SENIORITY_BONUS_RATE,
          amount: seniorityBonus,
        });
      }
    }

    const amount = baseSalary + thirteenthMonth + seniorityBonus;
    return { amount, rubrics };
  }

  async calculateBonus(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<BonusResult> {
    const transfers = await this.prisma.salaryTransfer.findMany({
      where: {
        employeeId,
        type: 'bonus',
        status: 'completed',
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    const total = transfers.reduce((sum, t) => sum + t.amount, 0);
    const rubrics: Rubric[] = transfers.map((t) => ({
      label: `Bonus: ${t.description || 'Prime'}`,
      type: 'earning' as const,
      base: t.amount,
      rate: 1,
      amount: t.amount,
    }));

    return { total, rubrics };
  }

  async calculateOvertime(
    employeeId: string,
    month: number,
    year: number,
    overtimeRate: number,
  ): Promise<OvertimeResult> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        clockIn: { gte: startOfMonth, lte: endOfMonth },
        clockOut: { not: null },
      },
    });

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    const baseSalary = employee?.salary ?? 0;
    const hourlyRate = baseSalary / (this.STANDARD_MONTHLY_DAYS * this.STANDARD_DAILY_HOURS);

    let totalOvertimeHours = 0;

    for (const record of attendanceRecords) {
      if (!record.clockOut) continue;

      const breakDuration =
        record.breakStart && record.breakEnd
          ? (record.breakEnd.getTime() - record.breakStart.getTime()) / (1000 * 60 * 60)
          : 0;

      const workedHours =
        (record.clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60) - breakDuration;

      if (workedHours > this.STANDARD_DAILY_HOURS) {
        totalOvertimeHours += workedHours - this.STANDARD_DAILY_HOURS;
      }
    }

    totalOvertimeHours = Math.round(totalOvertimeHours * 100) / 100;

    let overtimePay = 0;
    const rubrics: Rubric[] = [];

    if (totalOvertimeHours > 0) {
      const first8h = Math.min(totalOvertimeHours, 8);
      const beyond8h = Math.max(totalOvertimeHours - 8, 0);

      const payFirst8h = first8h * hourlyRate * overtimeRate;
      const payBeyond8h = beyond8h * hourlyRate * (overtimeRate + 0.25);
      overtimePay = payFirst8h + payBeyond8h;

      if (first8h > 0) {
        rubrics.push({
          label: `Heures sup. x${Math.round(overtimeRate * 100)}%`,
          type: 'earning',
          base: hourlyRate,
          rate: overtimeRate,
          amount: payFirst8h,
        });
      }

      if (beyond8h > 0) {
        rubrics.push({
          label: `Heures sup. x${Math.round((overtimeRate + 0.25) * 100)}%`,
          type: 'earning',
          base: hourlyRate,
          rate: overtimeRate + 0.25,
          amount: payBeyond8h,
        });
      }
    }

    return { totalHours: totalOvertimeHours, totalPay: overtimePay, rubrics };
  }

  calculateSocialContributions(grossSalary: number, taxRate: number): SocialContributionsResult {
    const rubrics: Rubric[] = [];

    const csgDeductible = grossSalary * 0.068;
    rubrics.push({
      label: 'CSG déductible',
      type: 'deduction',
      base: grossSalary,
      rate: 0.068,
      amount: csgDeductible,
    });

    const csgNonDeductible = grossSalary * 0.024;
    rubrics.push({
      label: 'CSG non déductible',
      type: 'deduction',
      base: grossSalary,
      rate: 0.024,
      amount: csgNonDeductible,
    });

    const crds = grossSalary * 0.005;
    rubrics.push({
      label: 'CRDS',
      type: 'deduction',
      base: grossSalary,
      rate: 0.005,
      amount: crds,
    });

    const urssaf = grossSalary * 0.22;
    rubrics.push({
      label: 'URSSAF',
      type: 'deduction',
      base: grossSalary,
      rate: 0.22,
      amount: urssaf,
    });

    const retraite = grossSalary * 0.0315;
    rubrics.push({
      label: 'Retraite complémentaire',
      type: 'deduction',
      base: grossSalary,
      rate: 0.0315,
      amount: retraite,
    });

    const mutuelle = grossSalary * 0.02;
    rubrics.push({
      label: 'Mutuelle',
      type: 'deduction',
      base: grossSalary,
      rate: 0.02,
      amount: mutuelle,
    });

    const prevoyance = grossSalary * 0.005;
    rubrics.push({
      label: 'Prévoyance',
      type: 'deduction',
      base: grossSalary,
      rate: 0.005,
      amount: prevoyance,
    });

    const total = csgDeductible + csgNonDeductible + crds + urssaf + retraite + mutuelle + prevoyance;

    return { total, breakdown: rubrics };
  }

  calculateIncomeTax(netSocial: number, taxRate: number): IncomeTaxResult {
    const amount = netSocial * taxRate;
    const rubrics: Rubric[] = [
      {
        label: 'Prélèvement à la source (PAS)',
        type: 'deduction',
        base: netSocial,
        rate: taxRate,
        amount,
      },
    ];

    return { amount, rate: taxRate, rubrics };
  }

  generateDetailedBulletin(
    grossSalary: number,
    contributions: SocialContributionsResult,
    tax: IncomeTaxResult,
    netPayable: number,
    overtime: OvertimeResult,
    bonus: BonusResult,
    grossRubrics: Rubric[],
  ): DetailedBulletin {
    const allRubrics: Rubric[] = [
      ...grossRubrics,
      ...overtime.rubrics,
      ...bonus.rubrics,
      ...contributions.breakdown,
      ...tax.rubrics,
    ];

    return {
      grossSalary,
      totalContributions: contributions.total,
      incomeTax: tax.amount,
      netSocial: grossSalary - contributions.total,
      netPayable,
      overtimeHours: overtime.totalHours,
      overtimePay: overtime.totalPay,
      bonusTotal: bonus.total,
      rubrics: allRubrics,
    };
  }
}
