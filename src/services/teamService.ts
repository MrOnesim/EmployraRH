import api from '../lib/axios';
import type { Team } from '../types';
import { mapTeam, mapTeams } from '../utils/mappers';

export async function getTeams(companyId: string): Promise<Team[]> {
  const { data } = await api.get('/teams', { params: { companyId } });
  return mapTeams(data);
}

export async function createTeam(team: {
  companyId: string;
  name: string;
  description?: string;
  leaderId?: string;
  memberIds?: string[];
}): Promise<Team> {
  const { data } = await api.post('/teams', team);
  return mapTeam(data);
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  const { data } = await api.patch(`/teams/${id}`, updates);
  return mapTeam(data);
}

export async function deleteTeam(id: string): Promise<void> {
  await api.delete(`/teams/${id}`);
}
