import api from '../lib/axios';
import type { Notification } from '../types';
import { mapNotification, mapNotifications } from '../utils/mappers';

export async function getNotifications(params: { userId: string }): Promise<Notification[]> {
  const { data } = await api.get('/notifications', { params });
  return mapNotifications(data);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { data } = await api.get(`/notifications/unread-count/${userId}`);
  return data.count;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return mapNotification(data);
}

export async function markAllNotificationsRead(userId: string): Promise<{ count: number }> {
  const { data } = await api.post('/notifications/mark-all-read', { userId });
  return data;
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
