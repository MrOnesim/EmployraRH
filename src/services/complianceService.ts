import api from '../lib/axios';

export interface ComplianceCountry {
  countryCode: string;
}

export interface ContributionBreakdown {
  code: string;
  label: string;
  employerAmount: number;
  employeeAmount: number;
  cap: number | null;
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  amount: number;
}

export interface PayrollResult {
  grossSalary: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  incomeTax: number;
  netSocial: number;
  netPayable: number;
  contributions: ContributionBreakdown[];
  taxBracketsApplied: TaxBracket[];
  metadata: { countryCode: string; rulesVersion: number; effectiveDate: string };
}

export interface SimulationInput {
  grossSalary: number;
  countryCode: string;
  month: number;
  year: number;
}

export async function getSupportedCountries(): Promise<string[]> {
  const { data } = await api.get('/compliance/countries');
  return data;
}

export async function simulatePayslip(
  input: SimulationInput,
): Promise<{ result: PayrollResult; countryCode: string }> {
  const { data } = await api.post('/compliance/simulate', input);
  return data;
}

export async function simulatePayslipPdf(input: SimulationInput): Promise<Blob> {
  const { data } = await api.post('/compliance/simulate/pdf', input, { responseType: 'blob' });
  return data;
}
