import api from '../lib/axios';
import type { Employee, Invitation } from '../types';
import { mapEmployee, mapEmployees } from '../utils/mappers';

export async function getEmployees(companyId?: string): Promise<Employee[]> {
  const { data } = await api.get('/employees', { params: { companyId } });
  return mapEmployees(data);
}

export async function getEmployee(id: string): Promise<Employee> {
  const { data } = await api.get(`/employees/${id}`);
  return mapEmployee(data);
}

export async function createEmployee(employee: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  salary?: number;
  companyId: string;
}): Promise<Employee> {
  const { data } = await api.post('/employees', employee);
  return mapEmployee(data);
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  const { data } = await api.patch(`/employees/${id}`, updates);
  return mapEmployee(data);
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export async function sendInvitation(email: string, companyId: string): Promise<Invitation> {
  const { data } = await api.post('/invitations', { email, companyId });
  return data;
}

export async function acceptInvitation(id: string): Promise<void> {
  await api.put(`/invitations/${id}/accept`);
}
