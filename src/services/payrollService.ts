import api from '../lib/axios';
import type { Payslip } from '../types';
import { mapPayslip, mapPayslips } from '../utils/mappers';

export async function getPayslips(companyId: string): Promise<Payslip[]> {
  const { data } = await api.get('/payslips', { params: { companyId } });
  return mapPayslips(data);
}

export async function getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
  const { data } = await api.get(`/payslips/employee/${employeeId}`);
  return mapPayslips(data);
}

export async function generatePayslip(employeeId: string, month: number, year: number): Promise<Payslip> {
  const { data } = await api.post('/payslips/generate', { employeeId, month, year });
  return mapPayslip(data);
}
