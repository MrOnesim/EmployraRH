import api from '../lib/axios';
import type { Company } from '../types';

export async function getCompany(id: string): Promise<Company> {
  const { data } = await api.get(`/companies/${id}`);
  return data;
}

export async function getCompanies(): Promise<Company[]> {
  const { data } = await api.get('/companies');
  return data;
}
