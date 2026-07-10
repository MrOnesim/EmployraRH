import api from '../lib/axios';
import type { BankAccount, BankTransaction, SalaryAdvance, SalaryTransfer } from '../types';
import { mapBankAccount, mapBankAccounts, mapBankTransactions, mapSalaryAdvance, mapSalaryAdvances, mapSalaryTransfer, mapSalaryTransfers } from '../utils/mappers';

export async function getBankAccounts(params: { companyId: string }): Promise<BankAccount[]> {
  const { data } = await api.get('/bank-accounts', { params });
  return mapBankAccounts(data);
}

export async function createBankAccount(account: {
  bankName: string; accountName: string; accountNumber: string;
  iban?: string; swift?: string; currency?: string;
  isMobileMoney?: boolean; mobileProvider?: string; companyId: string;
}): Promise<BankAccount> {
  const { data } = await api.post('/bank-accounts', account);
  return mapBankAccount(data);
}

export async function updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
  const { data } = await api.patch(`/bank-accounts/${id}`, updates);
  return mapBankAccount(data);
}

export async function deleteBankAccount(id: string): Promise<void> {
  await api.delete(`/bank-accounts/${id}`);
}

export async function setDefaultBankAccount(id: string): Promise<BankAccount> {
  const { data } = await api.post(`/bank-accounts/${id}/default`);
  return mapBankAccount(data);
}

export async function getBankTransactions(params: { companyId: string }): Promise<BankTransaction[]> {
  const { data } = await api.get('/bank-transactions', { params });
  return mapBankTransactions(data);
}

export async function getTransactionsByAccount(accountId: string): Promise<BankTransaction[]> {
  const { data } = await api.get(`/bank-transactions/by-account/${accountId}`);
  return mapBankTransactions(data);
}

export async function getSalaryAdvances(params: { companyId: string }): Promise<SalaryAdvance[]> {
  const { data } = await api.get('/salary-advances', { params });
  return mapSalaryAdvances(data);
}

export async function getSalaryAdvancesByEmployee(employeeId: string): Promise<SalaryAdvance[]> {
  const { data } = await api.get(`/salary-advances/employee/${employeeId}`);
  return mapSalaryAdvances(data);
}

export async function requestSalaryAdvance(advance: {
  employeeId: string; amount: number; currency?: string; reason?: string;
}): Promise<SalaryAdvance> {
  const { data } = await api.post('/salary-advances', advance);
  return mapSalaryAdvance(data);
}

export async function approveSalaryAdvance(id: string, approvedBy: string): Promise<SalaryAdvance> {
  const { data } = await api.patch(`/salary-advances/${id}/approve`, { approvedBy });
  return mapSalaryAdvance(data);
}

export async function rejectSalaryAdvance(id: string): Promise<SalaryAdvance> {
  const { data } = await api.patch(`/salary-advances/${id}/reject`);
  return mapSalaryAdvance(data);
}

export async function markSalaryAdvancePaid(id: string): Promise<SalaryAdvance> {
  const { data } = await api.patch(`/salary-advances/${id}/paid`);
  return mapSalaryAdvance(data);
}

export async function getSalaryTransfers(companyId: string): Promise<SalaryTransfer[]> {
  const { data } = await api.get(`/salary-transfers/company/${companyId}`);
  return mapSalaryTransfers(data);
}

export async function getSalaryTransfersByEmployee(employeeId: string): Promise<SalaryTransfer[]> {
  const { data } = await api.get(`/salary-transfers/employee/${employeeId}`);
  return mapSalaryTransfers(data);
}

export async function createSalaryTransfer(transfer: {
  employeeId: string; amount: number; currency?: string;
  type: string; description: string;
}): Promise<SalaryTransfer> {
  const { data } = await api.post('/salary-transfers', transfer);
  return mapSalaryTransfer(data);
}
