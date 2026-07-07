import api from '../lib/axios';
import type { Leave } from '../types';

export async function getLeaves(companyId: string): Promise<Leave[]> {
  const { data } = await api.get('/leaves', { params: { companyId } });
  return data;
}

export async function getLeavesByEmployee(employeeId: string): Promise<Leave[]> {
  const { data } = await api.get(`/leaves/employee/${employeeId}`);
  return data;
}

export async function requestLeave(leave: { employeeId: string; type: string; startDate: string; endDate: string; reason?: string }): Promise<Leave> {
  const { data } = await api.post('/leaves', leave);
  return data;
}

export async function approveLeave(id: string): Promise<Leave> {
  const { data } = await api.patch(`/leaves/${id}`, { status: 'approved' });
  return data;
}

export async function rejectLeave(id: string): Promise<Leave> {
  const { data } = await api.patch(`/leaves/${id}`, { status: 'rejected' });
  return data;
}
