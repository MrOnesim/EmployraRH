import api from '../lib/axios';
import type { Attendance } from '../types';

export async function getAttendance(companyId: string): Promise<Attendance[]> {
  const { data } = await api.get('/attendance', { params: { companyId } });
  return data;
}

export async function getAttendanceByEmployee(employeeId: string): Promise<Attendance[]> {
  const { data } = await api.get(`/attendance/employee/${employeeId}`);
  return data;
}

export async function clockIn(employeeId: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/clock-in/${employeeId}`);
  return data;
}

export async function startBreak(id: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/break/start/${id}`);
  return data;
}

export async function endBreak(id: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/break/end/${id}`);
  return data;
}

export async function clockOut(id: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/clock-out/${id}`);
  return data;
}
