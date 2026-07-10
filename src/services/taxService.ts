import api from '../lib/axios';
import type { TaxDeclaration } from '../types';
import { mapTaxDeclaration, mapTaxDeclarations } from '../utils/mappers';

export async function getTaxDeclarations(params: { companyId: string }): Promise<TaxDeclaration[]> {
  const { data } = await api.get('/tax-declarations', { params });
  return mapTaxDeclarations(data);
}

export async function getTaxDeclarationsByYear(companyId: string, year: number): Promise<TaxDeclaration[]> {
  const { data } = await api.get('/tax-declarations/by-year', { params: { companyId, year } });
  return mapTaxDeclarations(data);
}

export async function createTaxDeclaration(declaration: {
  companyId: string; taxType: string; period: string;
  totalSalary: number; totalTax: number; dueDate: string;
}): Promise<TaxDeclaration> {
  const { data } = await api.post('/tax-declarations', declaration);
  return mapTaxDeclaration(data);
}

export async function submitTaxDeclaration(id: string): Promise<TaxDeclaration> {
  const { data } = await api.post(`/tax-declarations/${id}/submit`);
  return mapTaxDeclaration(data);
}

export async function markTaxPaid(id: string): Promise<TaxDeclaration> {
  const { data } = await api.post(`/tax-declarations/${id}/paid`);
  return mapTaxDeclaration(data);
}
