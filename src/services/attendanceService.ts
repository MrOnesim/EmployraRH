import api from '../lib/axios';
import type { Attendance } from '../types';
import { mapAttendance, mapAttendances } from '../utils/mappers';

export async function getAttendance(companyId: string): Promise<Attendance[]> {
  const { data } = await api.get('/attendance', { params: { companyId } });
  return mapAttendances(data);
}

export async function getAttendanceByEmployee(employeeId: string): Promise<Attendance[]> {
  const { data } = await api.get(`/attendance/employee/${employeeId}`);
  return mapAttendances(data);
}

export async function clockIn(employeeId: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/clock-in/${employeeId}`);
  return mapAttendance(data);
}

export async function startBreak(id: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/break/start/${id}`);
  return mapAttendance(data);
}

export async function endBreak(id: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/break/end/${id}`);
  return mapAttendance(data);
}

export async function clockOut(id: string): Promise<Attendance> {
  const { data } = await api.post(`/attendance/clock-out/${id}`);
  return mapAttendance(data);
}
