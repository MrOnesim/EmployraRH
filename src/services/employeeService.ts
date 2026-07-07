import api from '../lib/axios';
import type { Employee, Invitation } from '../types';

export async function getEmployees(): Promise<Employee[]> {
  const { data } = await api.get('/employees');
  return data;
}

export async function getEmployee(id: string): Promise<Employee> {
  const { data } = await api.get(`/employees/${id}`);
  return data;
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
  const { data } = await api.post('/employees', employee);
  return data;
}

export async function createMultipleEmployees(employees: Omit<Employee, 'id'>[]): Promise<Employee[]> {
  const { data } = await api.post('/employees/bulk', { employees });
  return data;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  const { data } = await api.patch(`/employees/${id}`, updates);
  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export async function sendInvitation(email: string): Promise<Invitation> {
  const { data } = await api.post('/invitations', { email });
  return data;
}

export async function acceptInvitation(id: string): Promise<void> {
  await api.put(`/invitations/${id}/accept`);
}
