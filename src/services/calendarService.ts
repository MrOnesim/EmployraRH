import api from '../lib/axios';
import type { CalendarEvent } from '../types';
import { mapCalendarEvent, mapCalendarEvents } from '../utils/mappers';

export async function getCalendarEvents(params: { companyId: string }): Promise<CalendarEvent[]> {
  const { data } = await api.get('/calendar-events', { params });
  return mapCalendarEvents(data);
}

export async function getUpcomingEvents(params: { companyId: string; limit?: number }): Promise<CalendarEvent[]> {
  const { data } = await api.get('/calendar-events/upcoming', { params });
  return mapCalendarEvents(data);
}

export async function getEventsByRange(params: { companyId: string; start: string; end: string }): Promise<CalendarEvent[]> {
  const { data } = await api.get('/calendar-events/range', { params });
  return mapCalendarEvents(data);
}

export async function getCalendarEvent(id: string): Promise<CalendarEvent> {
  const { data } = await api.get(`/calendar-events/${id}`);
  return mapCalendarEvent(data);
}

export async function createCalendarEvent(event: {
  title: string; description?: string; date: string; time?: string;
  location?: string; type: string; allDay?: boolean; attendees?: string[]; companyId: string;
}): Promise<CalendarEvent> {
  const { data } = await api.post('/calendar-events', event);
  return mapCalendarEvent(data);
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const { data } = await api.patch(`/calendar-events/${id}`, updates);
  return mapCalendarEvent(data);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await api.delete(`/calendar-events/${id}`);
}
