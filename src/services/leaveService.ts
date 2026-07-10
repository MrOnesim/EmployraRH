import api from '../lib/axios';
import type { Leave, LeaveBalance } from '../types';
import { mapLeave, mapLeaves } from '../utils/mappers';

export async function getLeaves(companyId: string): Promise<Leave[]> {
  const { data } = await api.get('/leaves', { params: { companyId } });
  return mapLeaves(data);
}

export async function getLeavesByEmployee(employeeId: string): Promise<Leave[]> {
  const { data } = await api.get(`/leaves/employee/${employeeId}`);
  return mapLeaves(data);
}

export async function getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
  const { data } = await api.get(`/leaves/employee/${employeeId}/balance`);
  return {
    employeeId,
    annual: { total: 25, used: 25 - (data.annual || 0) },
    sick: { total: -1, used: 0 },
    maternity: { total: -1, used: 0 },
    special: { total: -1, used: 0 },
  };
}

export async function requestLeave(leave: {
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<Leave> {
  const { data } = await api.post('/leaves', leave);
  return mapLeave(data);
}

export async function approveLeave(id: string): Promise<Leave> {
  const { data } = await api.patch(`/leaves/${id}/approve`);
  return mapLeave(data);
}

export async function rejectLeave(id: string, comment: string): Promise<Leave> {
  const { data } = await api.patch(`/leaves/${id}/reject`, { comment });
  return mapLeave(data);
}
