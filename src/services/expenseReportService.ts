import api from '../lib/axios';
import type { ExpenseReport } from '../types';
import { mapExpenseReport, mapExpenseReports } from '../utils/mappers';

export async function getExpenseReports(params: { companyId: string }): Promise<ExpenseReport[]> {
  const { data } = await api.get('/expense-reports', { params });
  return mapExpenseReports(data);
}

export async function getExpenseReportsByEmployee(employeeId: string): Promise<ExpenseReport[]> {
  const { data } = await api.get(`/expense-reports/employee/${employeeId}`);
  return mapExpenseReports(data);
}

export async function createExpenseReport(report: {
  employeeId: string; title: string; category: string;
  amount: number; currency?: string; description?: string;
  receiptUrl?: string; missionId?: string; companyId: string;
}): Promise<ExpenseReport> {
  const { data } = await api.post('/expense-reports', report);
  return mapExpenseReport(data);
}

export async function approveExpenseReport(id: string, comment?: string): Promise<ExpenseReport> {
  const { data } = await api.patch(`/expense-reports/${id}/approve`, { comment });
  return mapExpenseReport(data);
}

export async function rejectExpenseReport(id: string, reason?: string): Promise<ExpenseReport> {
  const { data } = await api.patch(`/expense-reports/${id}/reject`, { reason });
  return mapExpenseReport(data);
}
