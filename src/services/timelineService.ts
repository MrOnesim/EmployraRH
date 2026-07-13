import api from '../lib/axios';
import type { TimelineEvent } from '../types';
import { mapTimelineEvent, mapTimelineEvents } from '../utils/mappers';

export async function getTimeline(companyId: string): Promise<TimelineEvent[]> {
  const { data } = await api.get('/timeline', { params: { companyId } });
  return mapTimelineEvents(data);
}

export async function getTimelineByEmployee(employeeId: string): Promise<TimelineEvent[]> {
  const { data } = await api.get(`/timeline/employee/${employeeId}`);
  return mapTimelineEvents(data);
}

export async function createTimelineEvent(event: {
  employeeId: string;
  type: string;
  title: string;
  description?: string;
  date?: string;
}): Promise<TimelineEvent> {
  const { data } = await api.post('/timeline', event);
  return mapTimelineEvent(data);
}
