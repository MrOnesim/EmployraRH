export interface PayrollInput {
  grossSalary: number;
  countryCode: string;
  employeeId?: string;
  period: Date;
}

export interface ContributionBreakdown {
  code: string;
  label: string;
  employerAmount: number;
  employeeAmount: number;
  cap: number | null;
}

export interface PayrollResult {
  grossSalary: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  incomeTax: number;
  netSocial: number;
  netPayable: number;
  contributions: ContributionBreakdown[];
  taxBracketsApplied: { min: number; max: number | null; rate: number; amount: number }[];
  metadata: { countryCode: string; rulesVersion: number; effectiveDate: string };
}

export interface LeaveEntitlement {
  type: string;
  label: string;
  daysEntitled: number;
  seniorityExtraDays: number;
  maxConsecutiveDays: number | null;
  paidByEmployerPct: number;
}

export interface CountryProvider {
  readonly countryCode: string;

  calculatePayroll(input: PayrollInput): Promise<PayrollResult>;

  getLeaveEntitlements(hireDate: Date): Promise<LeaveEntitlement[]>;

  getPublicHolidays(year: number): Promise<{ date: Date; name: string }[]>;

  getMinimumWage(): Promise<{ amount: number; period: string }>;
}
