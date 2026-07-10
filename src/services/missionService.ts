import api from '../lib/axios';
import type { Mission, ExpenseReport } from '../types';
import { mapMission, mapMissions } from '../utils/mappers';
import { mapExpenseReports } from '../utils/mappers';

export async function getMissions(params: { companyId: string }): Promise<Mission[]> {
  const { data } = await api.get('/missions', { params });
  return mapMissions(data);
}

export async function getMission(id: string): Promise<Mission> {
  const { data } = await api.get(`/missions/${id}`);
  return mapMission(data);
}

export async function getMissionsByEmployee(employeeId: string): Promise<Mission[]> {
  const { data } = await api.get(`/missions/employee/${employeeId}`);
  return mapMissions(data);
}

export async function createMission(mission: {
  employeeId: string; title: string; destination: string;
  startDate: string; endDate: string; description?: string;
  budget?: number; transportation?: string; accommodation?: string; companyId: string;
}): Promise<Mission> {
  const { data } = await api.post('/missions', mission);
  return mapMission(data);
}

export async function approveMission(id: string): Promise<Mission> {
  const { data } = await api.patch(`/missions/${id}/approve`);
  return mapMission(data);
}

export async function rejectMission(id: string): Promise<Mission> {
  const { data } = await api.patch(`/missions/${id}/reject`);
  return mapMission(data);
}

export async function completeMission(id: string, report?: string): Promise<Mission> {
  const { data } = await api.patch(`/missions/${id}/complete`, { report });
  return mapMission(data);
}

export async function getMissionExpenses(missionId: string): Promise<ExpenseReport[]> {
  const { data } = await api.get(`/missions/${missionId}/expenses`);
  return mapExpenseReports(data);
}
