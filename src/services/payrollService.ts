import api from '../lib/axios';
import type { Payslip } from '../types';

export async function getPayslips(companyId: string): Promise<Payslip[]> {
  const { data } = await api.get('/payslips', { params: { companyId } });
  return data;
}

export async function getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
  const { data } = await api.get(`/payslips/employee/${employeeId}`);
  return data;
}

export async function generatePayslip(employeeId: string): Promise<Payslip> {
  const { data } = await api.post('/payslips', { employeeId });
  return data;
}
