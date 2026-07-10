import api from '../lib/axios';
import type { Objective } from '../types';
import { mapObjective, mapObjectives } from '../utils/mappers';

export async function getObjectives(params: {
  companyId: string; category?: string; status?: string;
}): Promise<Objective[]> {
  const { data } = await api.get('/objectives', { params });
  return mapObjectives(data);
}

export async function getObjectivesByEmployee(employeeId: string): Promise<Objective[]> {
  const { data } = await api.get(`/objectives/employee/${employeeId}`);
  return mapObjectives(data);
}

export async function createObjective(objective: {
  employeeId: string; title: string; description?: string;
  category: string; deadline?: string; companyId: string;
}): Promise<Objective> {
  const { data } = await api.post('/objectives', objective);
  return mapObjective(data);
}

export async function updateObjectiveStatus(id: string, status: string): Promise<Objective> {
  const { data } = await api.patch(`/objectives/${id}/status`, { status });
  return mapObjective(data);
}

export async function updateObjective(id: string, updates: Partial<Objective>): Promise<Objective> {
  const { data } = await api.patch(`/objectives/${id}`, updates);
  return mapObjective(data);
}
