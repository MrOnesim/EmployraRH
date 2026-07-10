import api from '../lib/axios';
import type { SignatureRequest, SignatureTemplate } from '../types';
import { mapSignatureRequest, mapSignatureRequests, mapSignatureTemplate, mapSignatureTemplates } from '../utils/mappers';

export async function getSignatureRequests(params: { companyId: string }): Promise<SignatureRequest[]> {
  const { data } = await api.get('/signature-requests', { params });
  return mapSignatureRequests(data);
}

export async function getSignatureRequest(id: string): Promise<SignatureRequest> {
  const { data } = await api.get(`/signature-requests/${id}`);
  return mapSignatureRequest(data);
}

export async function createSignatureRequest(request: {
  documentName: string; documentType: string;
  initiatedBy: string; initiatedByName: string;
  message?: string; recipients?: any[]; expiresAt?: string; companyId: string;
}): Promise<SignatureRequest> {
  const { data } = await api.post('/signature-requests', request);
  return mapSignatureRequest(data);
}

export async function sendSignatureRequest(id: string): Promise<SignatureRequest> {
  const { data } = await api.patch(`/signature-requests/${id}/send`);
  return mapSignatureRequest(data);
}

export async function signDocument(id: string, recipientEmail: string): Promise<SignatureRequest> {
  const { data } = await api.patch(`/signature-requests/${id}/sign`, { recipientEmail });
  return mapSignatureRequest(data);
}

export async function completeSignatureRequest(id: string): Promise<SignatureRequest> {
  const { data } = await api.patch(`/signature-requests/${id}/complete`);
  return mapSignatureRequest(data);
}

export async function rejectSignatureRequest(id: string, reason: string): Promise<SignatureRequest> {
  const { data } = await api.patch(`/signature-requests/${id}/reject`, { reason });
  return mapSignatureRequest(data);
}

export async function deleteSignatureRequest(id: string): Promise<void> {
  await api.delete(`/signature-requests/${id}`);
}

export async function getSignatureTemplates(params: { companyId: string }): Promise<SignatureTemplate[]> {
  const { data } = await api.get('/signature-templates', { params });
  return mapSignatureTemplates(data);
}

export async function createSignatureTemplate(template: {
  name: string; description?: string; documentType: string;
  content: string; placeholders?: any[]; companyId: string;
}): Promise<SignatureTemplate> {
  const { data } = await api.post('/signature-templates', template);
  return mapSignatureTemplate(data);
}

export async function updateSignatureTemplate(id: string, updates: Partial<SignatureTemplate>): Promise<SignatureTemplate> {
  const { data } = await api.patch(`/signature-templates/${id}`, updates);
  return mapSignatureTemplate(data);
}

export async function deleteSignatureTemplate(id: string): Promise<void> {
  await api.delete(`/signature-templates/${id}`);
}
