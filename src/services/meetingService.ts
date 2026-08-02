import api from '../lib/axios';

interface Meeting {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  date: Date;
  duration: number;
  department?: string;
  participants: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export async function getMeetings(params?: {
  department?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Meeting[]> {
  const { data } = await api.get('/meetings', { params });
  return data;
}

export async function createMeeting(
  meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>,
): Promise<Meeting> {
  const { data } = await api.post('/meetings', meeting);
  return data;
}

export async function updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
  const { data } = await api.patch(`/meetings/${id}`, updates);
  return data;
}

export async function joinMeeting(
  meetingId: string,
  participant?: { name?: string; email?: string; employeeId?: string },
): Promise<void> {
  await api.post(`/meetings/${meetingId}/participants`, participant ?? {});
}

export async function leaveMeeting(meetingId: string, participantId: string): Promise<void> {
  await api.delete(`/meetings/${meetingId}/participants/${participantId}`);
}
