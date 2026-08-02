import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CountryProvider,
  PayrollInput,
  PayrollResult,
  LeaveEntitlement,
} from '../compliance.interface';

@Injectable()
export class FranceProvider implements CountryProvider {
  readonly countryCode = 'FR';

  constructor(private prisma: PrismaService) {}

  async calculatePayroll(input: PayrollInput): Promise<PayrollResult> {
    const { grossSalary, countryCode, period } = input;
    const effectiveDate = period;

    // Social contributions from DB
    const contributions = await this.prisma.socialContribution.findMany({
      where: {
        countryCode,
        effectiveFrom: { lte: effectiveDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }],
      },
    });

    const contribBreakdown = contributions.map((c) => {
      const base = c.cap ? Math.min(grossSalary, c.cap) : grossSalary;
      return {
        code: c.code,
        label: c.label,
        employerAmount: Math.round(base * c.employerRate * 100) / 100,
        employeeAmount: Math.round(base * c.employeeRate * 100) / 100,
        cap: c.cap,
      };
    });

    const totalEmployeeContributions = contribBreakdown.reduce((s, c) => s + c.employeeAmount, 0);
    const totalEmployerContributions = contribBreakdown.reduce((s, c) => s + c.employerAmount, 0);
    const netSocial = Math.round((grossSalary - totalEmployeeContributions) * 100) / 100;

    // Income tax — progressive brackets from DB
    const brackets = await this.prisma.taxBracket.findMany({
      where: {
        countryCode,
        type: 'IRPP',
        effectiveFrom: { lte: effectiveDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }],
      },
      orderBy: { minIncome: 'asc' },
    });

    let incomeTax = 0;
    const taxBracketsApplied: PayrollResult['taxBracketsApplied'] = [];
    for (const bracket of brackets) {
      const bracketMax = bracket.maxIncome ?? Infinity;
      const taxableInBracket = Math.max(0, Math.min(netSocial, bracketMax) - bracket.minIncome);
      const bracketTax = taxableInBracket * bracket.rate;
      incomeTax += bracketTax;
      if (taxableInBracket > 0) {
        taxBracketsApplied.push({
          min: bracket.minIncome,
          max: bracket.maxIncome,
          rate: bracket.rate,
          amount: Math.round(bracketTax * 100) / 100,
        });
      }
    }
    incomeTax = Math.round(incomeTax * 100) / 100;

    const netPayable = Math.round((netSocial - incomeTax) * 100) / 100;

    const version = contributions.length > 0 ? Math.max(...contributions.map((c) => c.version)) : 1;

    return {
      grossSalary,
      totalEmployeeContributions,
      totalEmployerContributions,
      incomeTax,
      netSocial,
      netPayable,
      contributions: contribBreakdown,
      taxBracketsApplied,
      metadata: {
        countryCode,
        rulesVersion: version,
        effectiveDate: effectiveDate.toISOString(),
      },
    };
  }

  async getLeaveEntitlements(hireDate: Date): Promise<LeaveEntitlement[]> {
    const rules = await this.prisma.leaveRule.findMany({
      where: { countryCode: 'FR' },
    });

    return rules.map((r) => ({
      type: r.type,
      label: r.label,
      daysEntitled: r.daysEntitled,
      seniorityExtraDays: r.seniorityExtraDays,
      maxConsecutiveDays: r.maxConsecutiveDays,
      paidByEmployerPct: r.paidByEmployerPct,
    }));
  }

  async getPublicHolidays(year: number) {
    const holidays = await this.prisma.publicHoliday.findMany({
      where: {
        countryCode: 'FR',
        OR: [{ isRecurring: true }, { year }],
      },
    });
    return holidays.map((h) => ({ date: h.date, name: h.name }));
  }

  async getMinimumWage() {
    const wage = await this.prisma.minimumWage.findFirst({
      where: {
        countryCode: 'FR',
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    return { amount: wage?.amount ?? 0, period: wage?.period ?? 'MONTHLY' };
  }
}
