import api from '../lib/axios';
import type { Conversation, ChatMessage } from '../types';

export async function getConversations(params: { companyId: string }): Promise<Conversation[]> {
  const { data } = await api.get('/conversations', { params });
  return data;
}

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data } = await api.get(`/conversations/${conversationId}/messages`);
  return data;
}

export async function sendMessage(conversationId: string, message: { senderId: string; content: string; type?: string }): Promise<ChatMessage> {
  const { data } = await api.post(`/conversations/${conversationId}/messages`, message);
  return data;
}

export async function createConversation(conversation: {
  companyId: string; participantIds: string[]; title?: string;
}): Promise<Conversation> {
  const { data } = await api.post('/conversations', conversation);
  return data;
}
